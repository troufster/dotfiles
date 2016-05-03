#!/usr/bin/env node

var lb = require('lemonbar');
var i3 = require('i3').createClient();

var colors = {
    bg_base : "#2871A1",
    wactive : "#ffffff",
    winactive :"#999999"
};

var glyphs = {
    forward : "",
    backward : "",
    space : " ".lbBg(colors.bg_base),
    clock : "",
    wsp : ""
};

function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

var helper = {
    addWs : function(ws, i, tot) {
        var clr = shadeColor2(colors.bg_base, i/15);
        var nclr = shadeColor2(colors.bg_base, (i+1)/15);
        var wsname = ` ${ws.name} `.lbBg(clr);
        
        wsname = ws.focused ? 
            wsname.lbFg(colors.wactive) : wsname.lbFg(colors.winactive);
 
        lb.append(wsname);
       
        
        if(i != (tot-1)) {
            lb.append(glyphs.forward.lbFg(clr).lbBg(nclr));
        } else {
            lb.append(glyphs.forward.lbFg(clr));
        }
        
    },
    addDateTime : function(order) {
        
        var clr = shadeColor2(colors.bg_base, order/15);
        var clr2 = 
        
        lb.append(
            lb.right + 
            glyphs.backward.lbFg(clr) + 
            glyphs.space +
            glyphs.clock.lbBg(clr) +
            glyphs.space +
            new Date().toLocaleDateString('sv-SE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' }).lbBg(clr) + 
            glyphs.space   
        );
        
        lb.append(
            
              glyphs.backward.lbFg("#328779").lbBg(clr) + 
              " ".lbBg("#328779") +
              new Date().toLocaleTimeString('sv-SE', {
                hour : '2-digit',
                minute : '2-digit'
            }).lbBg("#328779") +
            " ".lbBg("#328779")
        );
    }
}

lb.launch(
    {
        lemonbar: "/usr/bin/lemonbar",
        shell: "/bin/sh",
        sheloutput : true,
        background: "#1B3A40",
        foreground: "#fff",
        fonts : ["DejaVu Sans Mono for Powerline-9", "FontAwesome-11"]       
    }
);

function refresh() {
i3.workspaces(function(e, wsp) {
   //Draw workspaces
   lb.append(
       glyphs.space +
       glyphs.wsp.lbBg(colors.bg_base));
   
   for (let i = 0; i < wsp.length; i++) {
       let w = wsp[i];
      
       helper.addWs(w, i, wsp.length);
   }
   
   //right side
   helper.addDateTime(0);
   lb.write();
});
}



i3.on("workspace", function(d) {
    refresh();
})

refresh();
