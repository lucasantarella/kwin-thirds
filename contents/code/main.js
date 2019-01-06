
function windowCoordinatesAlmostEqual(a, b) {
  return Math.abs(a - b) < 2;
}

var nextCommandUsesTwoThirds = false;

function resizeAndMove(horizontalThird) {
  var placementArea = workspace.clientArea(KWin.PlacementArea, workspace.activeScreen, workspace.currentDesktop);
print(placementArea.y);

  var g = workspace.activeClient.geometry;

  var numThirds = nextCommandUsesTwoThirds ? 2 : 1;
  nextCommandUsesTwoThirds = false;

  var thirdWidth = placementArea.width / 3;
  var width = numThirds * thirdWidth;
  var left;
  if (numThirds == 1) {
    left = placementArea.x + horizontalThird * thirdWidth;
  } else if (numThirds == 2) {
    if (horizontalThird == 0) {
      left = placementArea.x;
    } else if (horizontalThird == 1) {
      left = placementArea.x + thirdWidth / 2;
    } else if (horizontalThird == 2) {
      left = placementArea.x + thirdWidth;
    }
  }

  var horizontalLayoutChanged = (
    !windowCoordinatesAlmostEqual(g.x, left) ||
    !windowCoordinatesAlmostEqual(g.width, width)
  );
  g.x = left;
  g.width = width;

  var top = placementArea.y;
  var fullHeight = placementArea.height;
  var halfHeight = fullHeight / 2;
  var verticalLayouts = [[top, fullHeight], [top, halfHeight], [top + halfHeight, halfHeight]];

  var currentVerticalLayout = null;
  for (var i = 0; i < verticalLayouts.length; ++i) {
    var y = verticalLayouts[i][0];
    var h = verticalLayouts[i][1];
    if (windowCoordinatesAlmostEqual(g.y, y) && windowCoordinatesAlmostEqual(g.height, h)) {
      currentVerticalLayout = i;
      break;
    }
  }

  var newVerticalLayout;
  if (currentVerticalLayout === null || horizontalLayoutChanged) {
    newVerticalLayout = 0;
  } else {
    newVerticalLayout = (currentVerticalLayout + 1) % verticalLayouts.length;
  }

  g.y = verticalLayouts[newVerticalLayout][0];
  g.height = verticalLayouts[newVerticalLayout][1];

  workspace.activeClient.geometry = g;

  // TODO: restore size when window is moved with mouse, if it hasn't been resized otherwise
}

function shortcut(text, defaultShortcut, func) {
  registerShortcut(text, text, defaultShortcut, func);
}

shortcut("Thirds: Window to Left", "Meta+Left", function () { resizeAndMove(0); });
shortcut("Thirds: Window To Middle", "Meta+Down", function () { resizeAndMove(1); });
shortcut("Thirds: Window to Right", "Meta+Right", function () { resizeAndMove(2); });

shortcut("Thirds: Next Command Uses 1/3", "Meta+1", function () { nextCommandUsesTwoThirds = false; });
shortcut("Thirds: Next Command Uses 2/3", "Meta+2", function () { nextCommandUsesTwoThirds = true; });
