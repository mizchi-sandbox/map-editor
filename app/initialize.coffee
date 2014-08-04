createDummyDungeon = ->
  [
    [1, 1, 1, 1, 1, 1, 1]
    [1, 0, 0, 0, 0, 0, 1]
    [1, 0, 1, 1, 1, 0, 1]
    [1, 0, 0, 0, 1, 0, 1]
    [1, 0, 1, 1, 0, 0, 1]
    [1, 0, 1, 0, 0, 1, 1]
    [1, 1, 1, 1, 1, 1, 1]
  ]

CELL_SIZE = 100
CAMERA_WIDTH = 500
CAMERA_HEIGHT = 500

cj = createjs

createCircle = ({
  size
  color
  onClick
} = {}) ->
  size ?= 10
  color ?= 'black'
  circle = new cj.Shape()
  circle.graphics
    .beginFill color
    .drawCircle(0, 0, size)
  circle.addEventListener 'click', ->
    console.log 'clicked'
    onClick?()
  circle

getPosition = (x, y) ->
  {x: x * CELL_SIZE, y: y * CELL_SIZE}

class Camera
  constructor: (@stage) ->

  moveTo: ({x, y}) ->
    pos = @getRealPosition({x, y})
    console.log pos.rx, pos.ry
    @stage.regX = + pos.rx - CAMERA_WIDTH/2
    @stage.regY = + pos.ry - CAMERA_HEIGHT/2
    @stage.update()

  moveWithAnimation: ({x, y}) ->
    pos = @getRealPosition({x, y})
    dx = + pos.rx - CAMERA_WIDTH/2
    dy = + pos.ry - CAMERA_HEIGHT/2
    cj.Tween.get(stage).to({regX: dx, regY: dy}, 300).call -> console.log 'done'

  getRealPosition: ({x, y}) ->
    {rx: x * CELL_SIZE, ry: y * CELL_SIZE}

getRealPosition = ({x, y}) ->
  {rx: x * CELL_SIZE, ry: y * CELL_SIZE}

$ =>
  cj.Ticker.setFPS(20)
  cj.Ticker.on 'tick', -> stage.update()

  map = createDummyDungeon()

  canvas = document.getElementById("canvas")
  stage = new cj.Stage canvas
  window.stage = stage
  pathFinder = new PathFinder

  onDrag = false
  isLock = false

  [regX, regY] = []

  new Hammer(canvas)
  .on 'dragstart', (ev) ->
    onDrag = true
    regX = stage.regX
    regY = stage.regY
  .on 'drag', (ev) ->
    stage.regX = regX - ev.gesture.deltaX
    stage.regY = regY - ev.gesture.deltaY
    stage.update()
    console.log 'drag', ev.gesture.deltaX, ev.gesture.deltaY
  .on 'dragend', (ev) ->
    onDrag = false
    console.log 'dragend', ev.gesture

  camera = new Camera(stage)

  startPoint = [3, 3]
  camera.moveTo x: 3, y: 3

  for row, x in map
    for wall, y in row
      if wall is 0
        circle = do (x, y) ->
          circle = createCircle
            color: 'black'
            onClick: ->
              paths = pathFinder.searchPath(map, startPoint, [x, y])
              console.log 'step',step, ':', px, py for [px, py], step in paths if paths

              done = ->
                startPoint = [x, y]
                console.log 'done'
              if paths
                paths.shift()

                tween = _.reduce paths, (t, [px, py]) ->
                  {rx, ry} = getRealPosition({x: px, y: py})
                  t.to({regX: rx - CAMERA_WIDTH/2, regY: ry - CAMERA_HEIGHT/2}, 300)
                , cj.Tween.get(stage)
                tween.call done
              else
                camera.moveWithAnimation({x, y}).call done

          circle.x = x * CELL_SIZE
          circle.y = y * CELL_SIZE
          circle

        stage.addChild(circle)
      unless wall
        right = map[x+1]?[y]
        down = map[x][y+1]

        if right is 0
          edge = createCircle(size: 5, color: 'grey')
          edge.x = x * CELL_SIZE + CELL_SIZE/2
          edge.y = y * CELL_SIZE
          stage.addChild edge
        if down is 0
          edge = createCircle(size: 5, color: 'grey')
          edge.x = x * CELL_SIZE
          edge.y = y * CELL_SIZE + CELL_SIZE/2
          stage.addChild edge

  stage.update()
