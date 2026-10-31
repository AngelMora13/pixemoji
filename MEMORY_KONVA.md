# MEMORY_KONVA.md — Hallazgos Técnicos y Arquitectura de Konva (v10.6.0)

Este documento registra los hallazgos técnicos más importantes derivados del análisis profundo del código fuente de **Konva.js (v10.6.0)** instalada en este proyecto, enfocado en la interacción entre `Konva.Transformer`, `Konva.Shape`, la manipulación de matrices 2D y el renderizado de texto enriquecido.

---

## 1. Arquitectura Interna de `Konva.Transformer`

### 1.1 Ciclo de Vida del Arrastre de Anclas
Cuando el usuario arrastra un ancla del Transformer, Konva ejecuta el siguiente flujo interno en cada evento del puntero:

```
[Window PointerMove]
       │
       ▼
_handleMouseMove(e)
       │
       ▼
_moveTransform(e)
   ├── Calcula nueva posición del ancla activa (con restricción de rotación y aspecto)
   ├── Determina el rectángulo envolvente resultante: `newAttrs` (x, y, width, height, rotation)
   └── Invoca `_fitNodesInto(newAttrs, evt)`
          │
          ▼
_doFitNodesInto(newAttrs, evt)
   ├── Obtiene el rectángulo previo del nodo: `oldAttrs = this._getNodeRect()`
   ├── Construye matriz de transformación anterior: `oldTr`
   ├── Construye matriz de transformación nueva: `newTr`
   ├── Calcula matriz delta: `delta = newTr * oldTr.invert()`
   ├── Aplica delta a cada nodo adjunto:
   │      `newLocalTransform = [parent.invert()] * [delta] * [parent] * [old local]`
   ├── Descompone la matriz resultante:
   │      `attrs = newLocalTransform.decompose()`
   │      `node.setAttrs(attrs)` (asigna x, y, scaleX, scaleY, rotation)
   ├── Dispara evento: `node._fire('transform', { evt, target: node })`
   └── Actualiza el Transformer: `this._resetTransformCache()`, `this.update()`
```

---

## 2. La Causa Raíz del "Salto Disruptivo" en Tiempo Real

### 2.1 Por qué resetear `scaleX(1)` y `scaleY(1)` durante `transform` rompe el Transformer
Si dentro del listener `node.on('transform')` se resetea la escala a `1` y se reasigna `fontSize` / `width` / `offsetY`:

1. **Incompatibilidad con la Matriz Acumulativa:**
   - Konva calcula `delta = newTr * oldTr.invert()`.
   - `newTr` proviene de la posición actual del cursor en el ratón.
   - Si en el frame anterior reseteamos `scaleX` y `scaleY` a `1`, `oldTr` se calcula asumiendo escala unitaria y dimensiones nuevas.
   - En el siguiente micropaso de 1px del ratón, Konva compara el movimiento absoluto del ratón con un `oldTr` mutado arbitrariamente, produciendo un salto exponencial en `attrs.x` y `attrs.y`.

2. **Desplazamiento del Centro por `offsetY`:**
   - En Konva, un nodo con `offsetX = width / 2` y `offsetY = height / 2` tiene su origen `(0, 0)` local en su **centro geométrico**.
   - La posición visual superior es `y - offsetY`.
   - Si al cambiar el texto de altura (e.g., de 60px a 50px) `offsetY` pasa de 30px a 25px sin alterar `y`, la coordenada superior salta automáticamente `5px` hacia abajo.
   - Al combinarse con el cálculo de Transformer, se produce un bucle de retroalimentación positivo donde la caja "huye" del cursor hacia arriba o en diagonal.

### 2.2 Por qué el ancho horizontal (`middle-right`) no saltaba
- Al arrastrar `middle-right` sobre un texto de una sola línea, solo cambiaba `width`.
- La altura (`height`) y la fuente no cambiaban, por lo que `offsetY` permanecía constante.
- La coordenada `Y` no sufría desplazamientos imprevistos.

---

## 3. Matemáticas del Espacio de Coordenadas y `getTransform()`

### 3.1 Cómo opera `Node.prototype.getTransform()`
El método nativo de Konva construye la matriz de transformación local de la siguiente manera:

```javascript
getTransform() {
    var tr = new Transform();
    tr.translate(this.x(), this.y());
    tr.rotate(this.rotation());
    tr.scale(this.scaleX(), this.scaleY());
    tr.skew(this.skewX(), this.skewY());
    tr.translate(-this.offsetX(), -this.offsetY());
    return tr;
}
```

### 3.2 Interpretación de Puntos Locales
Gracias a que Konva aplica `translate(-offsetX, -offsetY)` al final de la cadena de transformación:
- En el espacio local del nodo:
  - **Esquina superior izquierda:** `(0, 0)`
  - **Centro:** `(width / 2, height / 2)`
  - **Esquina inferior derecha:** `(width, height)`
  - **Puntos medios:** `(width / 2, 0)`, `(0, height / 2)`, `(width, height / 2)`, `(width / 2, height)`

Al evaluar:
```typescript
const stageCoord = shape.getTransform().point(localPoint);
```
Se obtiene la coordenada exacta proyectada en el espacio del padre (`Layer`), tomando en consideración posición, escala, rotación y `offset`.

---

## 4. Algoritmo de Anclaje Opuesto (Opposite-Anchor Pinning)

Para permitir que un nodo redimensione su tamaño interno (`fontSize`, `width`, `height`) manteniendo fija la esquina o borde opuesto sin un solo píxel de desplazamiento, se aplica el siguiente patrón:

### 4.1 Tabla de Anclas Opuestas
| Ancla Arrastrada | Ancla Opuesta Fija | Coordenada Local del Ancla Fija |
| :--- | :--- | :--- |
| `top-left` | `bottom-right` | `(width, height)` |
| `top-center` | `bottom-center` | `(width / 2, height)` |
| `top-right` | `bottom-left` | `(0, height)` |
| `middle-right` | `middle-left` | `(0, height / 2)` |
| `bottom-right` | `top-left` | `(0, 0)` |
| `bottom-center` | `top-center` | `(width / 2, 0)` |
| `bottom-left` | `top-right` | `(width, 0)` |
| `middle-left` | `middle-right` | `(width, height / 2)` |

### 4.2 Algoritmo de Compensación Subpixel en `transformend`
```typescript
// 1. Guardar la coordenada global del ancla opuesta ANTES de tocar escalas o dimensiones
const oppositeLocal = getOppositeAnchorPoint(shape, anchor);
const fixedPoint = shape.getTransform().point(oppositeLocal);

// 2. Consolidar nueva escala en propiedades nativas (fontSize / width)
if (anchor === 'middle-left' || anchor === 'middle-right') {
  shape.width(Math.max(Math.round(shape.width() * sx), 40));
} else {
  const isVertical = anchor === 'top-center' || anchor === 'bottom-center';
  const scale = isVertical ? sy : Math.max(sx, sy);
  const curFont = shape.getAttr('fontSize') || 44;
  shape.setAttr('fontSize', Math.max(Math.round(curFont * scale), 10));
  if (!isVertical) {
    shape.width(Math.max(Math.round(shape.width() * sx), 40));
  }
}

// 3. Resetear escala a 1 y recalcular dimensiones y offsets
shape.scaleX(1);
shape.scaleY(1);
updateRichTextLayout(shape); // recalcula width, height, offsetX, offsetY

// 4. Calcular dónde quedó el ancla opuesta tras la mutación
const newLocal = getOppositeAnchorPoint(shape, anchor);
const currentPoint = shape.getTransform().point(newLocal);

// 5. Compensar exactamente la diferencia en x e y
shape.x(shape.x() + (fixedPoint.x - currentPoint.x));
shape.y(shape.y() + (fixedPoint.y - currentPoint.y));

// 6. Actualizar visualmente Transformer y Capa
tr?.forceUpdate();
shape.getLayer()?.batchDraw();
```

---

## 5. Secuencia de Eventos y Estados Internos

### 5.1 Persistencia de `_movingAnchorName`
En `Konva.Transformer.prototype._removeEvents`:
```javascript
// Código fuente de Konva:
this._fire('transformend', { evt: e, target: node });
if (node) {
    this._nodes.forEach((target) => {
        target._fire('transformend', { evt: e, target });
    });
}
this._movingAnchorName = null; // <- Se limpia DESPUÉS de disparar los eventos
```
- Esto garantiza que dentro de `shape.on('transformend')`, `tr.getActiveAnchor()` todavía es legible.
- Sin embargo, para máxima seguridad ante cancelaciones táctiles o multi-touch, se captura también `lastAnchor` en `transformstart` y `transform`.

### 5.2 Orden de Disparo e Integración con Historial (Undo / Redo)
1. **`shape.on('transformend')`** se ejecuta primero (a nivel de nodo). Realiza el anclaje opuesto, resetea la escala a `1` y ajusta `(x, y)`.
2. **`stage.on('transformend')`** se ejecuta después (por propagación/burbujeo hacia el Stage).
3. **Resultado:** Cuando `saveHistoryState()` serializa el canvas a JSON, el nodo ya tiene `scaleX: 1, scaleY: 1` y las coordenadas `x, y` definitivas, garantizando un historial atómico sin transformaciones residuales.

---

## 6. Buenas Prácticas para Nuevos Componentes Konva

1. **No resetear escalas durante `transform`:** Usar aceleración por hardware de Konva durante el drag (60 FPS fluidos); consolidar medidas en `transformend`.
2. **Usar `shape.getTransform().point(...)`:** Nunca calcular posiciones de esquinas sumando manualmente `x + width`, ya que ignora rotaciones, offsets y escalado.
3. **Mantener `offsetX` y `offsetY` centrados para rotación:** Para que las rotaciones se produzcan alrededor del centro del objeto, mantener siempre `offsetX = width / 2` y `offsetY = height / 2`.
4. **Limpieza de caché en mutaciones de atributos:** Cuando se altere un atributo que impacte los límites o recorte (`cropInset`), invocar `node._clearCache()` y `tr.update()` para invalidar `_nodeRectCache` del Transformer.

---

## 7. Recorte No Destructivo y Sincronización con `Konva.Transformer`

### 7.1 El Problema del "Bounding Box Fantasma" al recortar con Canvas 2D Clip
Cuando se implementa un recorte no destructivo en Konva recortando el contexto en `Shape.prototype._sceneFunc` mediante `ctx.clip()`:
- El lienzo dibuja únicamente la porción visible.
- Sin embargo, `Konva.Transformer` obtiene las dimensiones del nodo llamando internamente a `node.getClientRect({ skipTransform: true, skipShadow: true, skipStroke: ignoreStroke })`.
- `Shape.prototype.getClientRect()` delega la medida base a `this.getSelfRect()`.
- Por defecto, `getSelfRect()` en `Konva.Image` devuelve `{ x: 0, y: 0, width: w, height: h }` y en `Konva.Text` las métricas de glifo completas.
- **Consecuencia:** Los anclajes de escala y rotación del Transformer se sitúan alrededor del tamaño original no recortado, flotando en el espacio vacío exterior y dificultando la manipulación táctil o con cursor.

### 7.2 Arquitectura de Solución: Parcheo de `getSelfRect()` y `_hitFunc`
Para que el Transformer y la interacción reconozcan milimétricamente el área recortada sin destruir los datos de la imagen o emoji original:

```
[getSelfRect() de Shape]
       │
       ├── ¿cropInset activo? (top, right, bottom, left > 0)
       │      │
       │      ├── SÍ ──► Calcula clipX, clipY, clipW, clipH en espacio local
       │      │          Retorna sub-caja exacta: { x: clipX, y: clipY, width: clipW, height: clipH }
       │      │
       │      └── NO  ──► Retorna baseRect (medida 100% original)
```

1. **Transformaciones 2D Transparentes:**
   - Konva aplica automáticamente la matriz de transformación del nodo (`x, y, rotation, scale, -offsetX, -offsetY`) sobre el rectángulo devuelto por `getSelfRect()`.
   - Al devolver la sub-caja recortada, el Transformer posiciona sus 8 anclajes y la caja punteada directamente en los bordes del fragmento visible.
2. **Hit Detection Precisa:**
   - Se parchea `_hitFunc` para trazar un `rect(clipX, clipY, clipW, clipH)` idéntico.
   - Las áreas vacías recortadas dejan de ser interactivas, permitiendo seleccionar capas que estén debajo o al lado sin interferencias.
3. **Invalidación de Caché en Transformer:**
   - Konva cachea internamente el bounding box en `tr._nodeRectCache`.
   - Al aplicar o resetear el recorte (`cropInset`), se debe forzar:
     ```typescript
     node._clearCache();
     const tr = node.getStage()?.findOne('Transformer');
     tr?.update();
     ```

---

## 8. Ergonomía Táctil en `Konva.Transformer` (Controles Circulares y Mobile)

### 8.1 Controles Circulares Nativos (`anchorCornerRadius`)
En Konva v10+, los anclajes del Transformer son instancias internas de `Konva.Rect`.
- Asignar `anchorCornerRadius: 100` (o `anchorSize / 2`) los transforma de forma nativa en **círculos perfectos**, eliminando el aspecto cuadrado anticuado sin necesidad de sobreescribir `anchorStyleFunc` ni inyectar formas pesadas.

### 8.2 Desacople del Pin de Rotación (`rotateAnchorOffset` y `rotateLineVisible`)
- **`rotateLineVisible: true`:** Dibuja el vástago vertical que une la caja delimitadora con el ancla de rotación.
- **`rotateAnchorOffset`:** Por defecto es `50`. Para evitar colisiones táctiles con el ancla `top-center` en dispositivos móviles:
  - En **móvil/touch**: `rotateAnchorOffset: 38`, `anchorSize: 22`, `anchorStrokeWidth: 2.5`.
  - En **desktop**: `rotateAnchorOffset: 28`, `anchorSize: 14`, `anchorStrokeWidth: 2`.
- Esto separa físicamente el ancla de rotación del borde superior y de `top-center`, evitando toques erróneos accidentales al manipular con la yema de los dedos.

