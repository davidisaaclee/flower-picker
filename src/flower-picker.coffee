polToCar = (angle, radius) ->
  x: radius * (Math.cos angle)
  y: radius * (Math.sin angle)

centerToOffset = ({x, y}, element) ->
  rect = element.getBoundingClientRect()

  top: y - (rect.height / 2)
  left: x - (rect.width / 2)

elementCenterPosition = (element, relativeTo) ->
  elmBounds = element.getBoundingClientRect()
  relBounds = relativeTo.getBoundingClientRect()

  x: elmBounds.left - relBounds.left + (elmBounds.width / 2)
  y: elmBounds.top - relBounds.top + (elmBounds.height / 2)

checkContainment = (subRect, inRect) ->
  (subRect.left   >= inRect.left)  and
  (subRect.top    >= inRect.top)   and
  (subRect.right  <= inRect.right) and
  (subRect.bottom <= inRect.bottom)

rectFromOffset = (baseRect, {x, y}) ->
  result =
    left: x + baseRect.left,
    top: y + baseRect.top,
    width: baseRect.width,
    height: baseRect.height
  result['right'] = result.left + result.width
  result['bottom'] = result.top + result.height
  return result

# currently unused
# distance = (v1, v2) ->
#   Math.sqrt ((v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y))

TWO_PI = Math.PI * 2

toCssFigure = (num) -> num.toPrecision(8)

Polymer
  is: 'flower-picker'

  properties:
    petals:
      type: Array
    radius:
      type: Number
      value: 80

  listeners:
    'down': '_handleDown'
    'up': '_handleUp'
    'track': '_handleTrack'

  # ready: () ->

  start: (origin) ->
    @_spawnFlower origin, @petals

  finish: ({x, y}) ->
    if @_overPetal? and @_overPetal.isLeaf
      this.fire 'selected',
        petal: @_overPetal
        value: if @_overPetal.value? then @_overPetal.value @_overPetal.model else @_overPetal.model

    # delete each flower node; return flower list to empty
    @_flowers.forEach (flower) ->
      Polymer.dom(Polymer.dom(flower.element).parentNode).removeChild(flower.element)
    @_flowers = []
    @_overPetal = null

  # ---- State fields ---- #

  # all flowers in the current stack
  _flowers: []

  # state: currently hovered-over petal
  _overPetal: null


  # ---- Convenience references ---- #

  _container: () -> this.$['picker-container']


  # ---- Private methods ---- #

  _createPetalElement: (model, flowerIndex) ->
    petal = document.createElement 'div'

    if not model.isBackPetal?
      Polymer.dom(petal).classList.add 'petal'
      Polymer.dom(petal).classList.add 'unselectable'
      petal.addEventListener 'trackover', (detail) => @_hoverPetal petal, model, flowerIndex
      petal.addEventListener 'trackout', (detail) => @_unhoverPetal petal
      Polymer.dom(petal).innerHTML =
        if model.display?
        then model.display(model.model)
        else model.model

      if model.isLeaf
      then Polymer.dom(petal).classList.add 'leaf'
      else Polymer.dom(petal).classList.add 'branch'
    else
      # is a back-petal; don't draw anything for now?

    return petal

  _spawnFlower: (origin, petals, backPetalPoint) ->
    spawningFlowerIndex = @_flowers.length

    flower = document.createElement 'div'
    Polymer.dom(flower).setAttribute 'id', "flower#{spawningFlowerIndex}"
    Polymer.dom(flower).classList.add 'flower'
    Polymer.dom(this.$['picker-container']).appendChild flower

    pistil = document.createElement 'div'
    Polymer.dom(pistil).classList.add 'pistil'
    Polymer.dom(pistil).classList.add 'unselectable'
    Polymer.dom(pistil).setAttribute 'id', "pistil#{spawningFlowerIndex}"
    Polymer.dom(flower).appendChild pistil

    offsetFlower = do ->
      {top, left} = centerToOffset origin, flower
      left: toCssFigure left
      top: toCssFigure top
    this.transform "translate(#{offsetFlower.left}px, #{offsetFlower.top}px)", flower

    offsetPistil = do ->
      {top, left} = centerToOffset (elementCenterPosition flower, flower), pistil
      left: toCssFigure left
      top: toCssFigure top
    this.transform "translate(#{offsetPistil.left}px, #{offsetPistil.top}px)", pistil
    pistil.addEventListener 'trackover', (evt) => @_hoverPistil spawningFlowerIndex

    # deactivate lower flowers
    if @_flowers.length != 0
      # console.log "distance: #{distance @_flowers[@_flowers.length - 1].origin, origin}"
      @_deactivateFlower @_flowers[@_flowers.length - 1]

    # offset angle for back petal
    # angleOffset =
    #   if backPetalPoint?
    #   then do ->
    #     vecDiff =
    #       x: origin.x - backPetalPoint.x
    #       y: origin.y - backPetalPoint.y
    #     compensation =
    #       if vecDiff.x < 0 then Math.PI
    #       else if vecDiff.y < 0 then TWO_PI
    #       else 0
    #     return Math.PI + Math.atan(vecDiff.y / vecDiff.x) + compensation
    #   else 0
    angleOffset = (Math.PI / (2 * petals.length)) + Math.PI
      # if petals.length == 1
      # then Math.PI
      # else Math.PI + (Math.PI / (2 * petals.length))

    # if backPetalPoint?
    #   petals = [ {isBackPetal: true}, petals... ]

    petalElements = petals.map (elm, idx) =>
      petal = @_createPetalElement elm, spawningFlowerIndex
      Polymer.dom(flower).appendChild petal

      center = polToCar (Math.PI * idx / petals.length + angleOffset), @radius
      offsetPetal = do -> centerToOffset center, petal
        # {top, left} = centerToOffset center, petal
        # top: toCssFigure top
        # left: toCssFigure left

      potentialRect =
        rectFromOffset petal.getBoundingClientRect(), {x: offsetPetal.left, y: offsetPetal.top}

      if not (checkContainment potentialRect, @_container().getBoundingClientRect())
        console.log 'not contained: ', petal

      this.transform "translate(#{toCssFigure offsetPetal.left}px, #{toCssFigure offsetPetal.top}px)", petal
      # console.log potentialRect, petal.getBoundingClientRect()

      return petal

    @_flowers.push
      element: flower
      origin: origin

  _deactivateFlower: (flower) ->
    Polymer.dom(flower.element).childNodes.forEach (node) ->
      if node.classList.contains 'petal'
        Polymer.dom(node).classList.add 'inactive-petal'
      else if node.classList.contains 'flower'
        Polymer.dom(node).classList.add 'inactive-flower'

  _activateFlower: (flower) ->
    Polymer.dom(flower.element).childNodes.forEach (node) ->
      if node.classList.contains 'petal'
        Polymer.dom(node).classList.remove 'inactive-petal'
        if node.classList.contains 'over-branch'
          Polymer.dom(node).classList.remove 'over-branch'
      else if node.classList.contains 'flower'
        Polymer.dom(node).classList.remove 'inactive-flower'

  _popFlower: () ->
    if @_flowers.length > 0
      flower = @_flowers[@_flowers.length - 1]
      Polymer.dom(Polymer.dom(flower.element).parentNode).removeChild(flower.element)
      @_flowers.splice (@_flowers.length - 1), 1

      if @_flowers.length != 0
        @_activateFlower @_flowers[@_flowers.length - 1]

  _createLinkElementFrom: (fromFlowerIndex) ->
    if (@_flowers.length - 1) > (fromFlowerIndex + 1)
      console.log 'Not enough flowers to make that link!'

    src = @_flowers[fromFlowerIndex]
    dst = @_flowers[fromFlowerIndex + 1]

    angle = -Math.acos ((dst.origin.x - src.origin.x) / @radius)

    linkElm = document.createElement 'div'
    Polymer.dom(@_container()).appendChild linkElm
    Polymer.dom(linkElm).classList.add 'pistil-link'
    linkElm.style['position'] = 'absolute'
    linkElm.style['width'] = "#{@radius}px"
    linkElm.style['hßeight'] = '5px'

    linkElm.style['transform'] = "rotate(#{angle}rad)"
    # linkElm.style['-webkit-transform'] = "rotate(#{angle}rad)"

    linkElm.style['background-color'] = '#faa'
    linkElm.style['left'] = src.origin.x + 'px'
    linkElm.style['top'] = src.origin.y + 'px'
    linkElm.style['transform-origin'] = 'center left'

  # ---- Event handlers ---- #

  _hoverPetal: (petalElement, petalModel, flowerIndex) ->
    if @_overPetal is petalModel
      # nothing to do
      return
    else if flowerIndex is (@_flowers.length - 1)
      petalElement.classList.add 'over-petal'
      @_overPetal = petalModel
      elementCenter = do =>
        petalRect = petalElement.getBoundingClientRect()
        fieldRect = this.$['picker-container'].getBoundingClientRect()
        x: petalRect.left - fieldRect.left + (petalRect.width / 2)
        y: petalRect.top - fieldRect.top + (petalRect.height / 2)
      if not @_overPetal.isLeaf
        Polymer.dom(petalElement).classList.add 'over-branch'
        @_spawnFlower \
          elementCenter, \
          @_overPetal.children, \
          (elementCenterPosition @_flowers[@_flowers.length - 1].element, this.$['picker-container'])
        @_createLinkElementFrom flowerIndex

  _unhoverPetal: (petalElement) ->
    petalElement.classList.remove 'over-petal'
    @_overPetal = null

  _hoverPistil: (depth) ->
    if depth >= @_flowers.length
      console.log "hovering over pistil of depth #{depth}, \
        but the flower stack is only #{@_flowers.length} deep."
    else if depth isnt @_flowers.length
      for i in [(@_flowers.length - 1)..(depth + 1)] by -1
        @_popFlower()

  _unhoverPistil: (index) ->
    # TODO

  _handleDown: ({detail}) ->
    fieldRect = this.$['picker-container'].getBoundingClientRect()
    @start
      x: detail.x - fieldRect.left
      y: detail.y - fieldRect.top

  _handleUp: ({detail}) ->
    fieldRect = this.$['picker-container'].getBoundingClientRect()
    @finish
      x: detail.x - fieldRect.left
      y: detail.y - fieldRect.top

  _lastHover: null
  _handleTrack: (evt, detail) ->
    hover = detail.hover()
    this.fire 'trackover', detail, {node: hover}

    if hover isnt @_lastHover
      this.fire 'trackout', detail, {node: @_lastHover}
      @_lastHover = hover


  # ---- Observers ---- #
