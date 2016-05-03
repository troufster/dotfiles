var lb = require(".");
var fa = require("fontawesome");

lb.launch({
    
    lemonbar: "/usr/bin/lemonbar",         // Lemonbar binary
    shell: "/bin/sh",                      // Shell to use for actions
    shelloutput: true,                     // Print shell STDOUT

    background: "#888",                    // Background color (#rgb, #rrggbb, #aarrggbb)
    foreground: "#333",                    // Foreground color
    lineWidth: 1, lineColor: "#666",       // Underline/Overline config
    geometry: {                            // Window geometry
        x: 0, y: 0,
        width: null, height: 50
    },
    fonts: ["Open Sans-10", "FontAwesome-10"],  // Load fonts
    
    bottom: false,                         // Dock bar at bottom instead of top
    forceDocking: false,                   // Force docking without asking the window manager
    name: null,                            // Set the WM_NAME atom value for the bar
    areas: 10                              // Number of clickable areas

})

function update() {
    lb.append(" Hey! ".lbFg("#6fc"))
    lb.append("This is an example!")
    lb.append(" " + fa[Object.keys(fa)[Math.floor(Math.random()*Object.keys(fa).length)]].lbFont("FontAwesome-10") + " ")

    lb.append((" " + fa.mousePointer.lbFont("FontAwesome-10") + " Click Me! ").lbAction("notify-send 'Hi! :D'").lbCenter.lbSwap)

    lb.append(lb.right + "It's " + (" " + new Date().toString() + " ").lbSwap)
    lb.write()
}
update()

// Update current time every second
setTimeout(function() {
    update()
    setInterval(update, 1000)
}, 1000 - new Date().getMilliseconds())
