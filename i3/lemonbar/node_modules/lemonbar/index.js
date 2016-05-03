var child = require("child_process");

global.lbfonts = [];
global.lbcurrentline = "";
global.lbinstance = null;
global.lbinstanceshell = null;

module.exports = {
    left: "%{l}", center: "%{c}", right: "%{r}",
    BUTTON_LEFT: 1,
    BUTTON_MIDDLE: 2,
    BUTTON_RIGHT: 3,
    BUTTON_SCROLLUP: 4,
    BUTTON_SCROLLDOWN: 5,
    launch: function(options) {
        if (global.lbinstance) throw Error("Lemonbar is already running!");

        if (!options) options = {};

        if (!options.lemonbar) options.lemonbar = "lemonbar" // The Lemonbar binary path
        if (!options.shell) options.shell = "sh" // The action shell binary path
        if (!options.shelloutput) options.shelloutput = true // If the STDOUT of the action shell should be printed

        var args = [];
        if (typeof options.geometry == "string") args.push("-g", options.geometry);
        else if (typeof options.geometry == "object") args.push("-g", 
            (options.geometry.width || "") +
            "x" + (options.geometry.height || "") +
            "+" + (options.geometry.x || "") +
            "+" + (options.geometry.y || "")
        );
        if (options.bottom) args.push("-b");
        if (options.forceDocking) args.push("-d");
        if (options.name) args.push("-n", options.name);
        if (options.lineWidth) args.push("-u", options.lineWidth.toString());
        if (options.areas) args.push("-a", options.areas);
        if (options.background) {
            if (!options.background.toString().match(/^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) throw Error("Invalid Background Color (must be in hexadecimal format)")
            args.push("-B", options.background);
        }
        if (options.foreground) {
            if (!options.foreground.toString().match(/^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) throw Error("Invalid Foreground Color (must be in hexadecimal format)")
            args.push("-F", options.foreground);
        }
        if (options.lineColor) {
            if (!options.lineColor.toString().match(/^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) throw Error("Invalid Line Color (must be in hexadecimal format)")
            args.push("-U", options.lineColor);
        }
        if (options.fonts) {
            if (typeof options.fonts == "string") options.fonts = [options.fonts]
            for (var i = 0; i < options.fonts.length; i++) {
                global.lbfonts.push(options.fonts[i]);
                args.push("-f", options.fonts[i]);
            }
        }

        if (process.env.LB_DEBUG) console.log(options.lemonbar + " " + args.join(" "))
        if (options.shell) global.lbinstanceshell = child.spawn(options.shell, {
            stdio: ["pipe", options.shelloutputs ? 1 : "ignore", 2]
        })
        global.lbinstance = child.spawn(options.lemonbar, args, {
            stdio: ["pipe", options.shell ? global.lbinstanceshell.stdin : "ignore", 2]
        })
    },
    append: function(text) {
        global.lbcurrentline += text || "";
    },
    write: function(text) {
        if (!global.lbinstance) throw Error("Lemonbar is not running!");
        global.lbcurrentline += text || "";
        if (process.env.LB_DEBUG) console.log(global.lbcurrentline);
        global.lbinstance.stdin.write(global.lbcurrentline + "\n");
        global.lbcurrentline = "";
    }
}



function addCode(name, start, end) {
    Object.defineProperty(String.prototype, name, {
        get: eval(
            "(function(){return " + 
            (start ? JSON.stringify(start) + " + " : "") +
            "this" +
            (end ? " + " + JSON.stringify(end) : "") +
            ";})"
        )
    });
}

addCode("lbSwap", "%{R}", "%{R}")
addCode("lbLeft", "%{l}")
addCode("lbCenter", "%{c}")
addCode("lbRight", "%{r}")
addCode("lbUnderline", "%{+u}", "%{u}")
addCode("lbOverline", "%{+u}", "%{u}")
String.prototype.lbBg = function(color) {
    if (!color.toString().match(/^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) throw Error("Invalid background color (must be in hexadecimal format)")
    return "%{B" + color + "}" + this + "%{B-}";
}
String.prototype.lbFg = function(color) {
    if (!color.toString().match(/^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) throw Error("Invalid foreground color (must be in hexadecimal format)")
    return "%{F" + color + "}" + this + "%{F-}";
}
String.prototype.lbFont = function(font) {
    if (!font || typeof font != "string") throw Error("Invalid font");
    if (lbfonts.indexOf(font) > -1) font = (lbfonts.indexOf(font) + 1).toString();
    else throw Error("Couldn't find font \"" + font + "\"");
    return "%{T" + font + "}" + this + "%{T-}";
}
String.prototype.lbLinecolor = function(color) {
    if (!color.toString().match(/^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3})$/i)) throw Error("Invalid foreground color (must be in hexadecimal format)")
    return "%{U" + color + "}" + this + "%{U-}";
}
String.prototype.lbAction = function(action, button) {
    if (!button) button = "";
    if (!button.toString().match(/^[1-5]?$/)) throw Error("Invalid action button " + button)
    if (action.toString().match(/\}/)) throw Error("Action can't contain closing curly braces due to a Lemonbar limitation")
    action = action.toString().replace(/([\:])/g, "\\$1")
    return "%{A" + (button || "") + ":" + action + ":}" + this + "%{A}";
}
String.prototype.lbMonitor = module.exports.monitor = function(screen) {
    screen == "next" && (screen = "+")
    screen == "prev" && (screen = "-")
    screen == "previous" && (screen = "-")
    screen == "first" && (screen = "f")
    screen == "last" && (screen = "l")
    if (!button.toString().match(/^[0-9+\-fl]?$/)) throw Error("Invalid screen")
    return "%{S" + screen + "}" + this;
}
