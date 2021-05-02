//https://github.com/bumbu/svg-pan-zoom
import * as filters from "./svg_filters.js";
//?svg=nrf52-sensor-tag&x=0.5&y=0.5&z=3.4#schematics
function deep_svg_xyz(embed,x,y,z,abs_xy=false){
    let viewport = embed.getSVGDocument().getElementsByClassName("svg-pan-zoom_viewport")[0]

    let zoom = ()=>{
        viewport.style.transition = "transform 1s ease"
        const name = embed.id.substring(4)
        let svg_pz = window[`svgpz-${name}`]
        if(!abs_xy){
            const abs_x = svg_pz.getSizes().width * x
            const abs_y = svg_pz.getSizes().height * y
            svg_pz.zoomAtPoint(z,{x:abs_x, y:abs_y},true)//absolute zoom value
        }else{
            console.log(`zooming in absolute pos (${x},${y})`)
            svg_pz.zoomAtPoint(z,{x:x,y:y},true)//absolute zoom value
        }
    }
    let deinit = ()=>{
        viewport.style.transition = ""
    }

    setTimeout(zoom,1000)
    setTimeout(deinit,2000)
}

function text_highlight_zoom(embed,svg,element,filter="glow"){
    let raw_e_box = element.getBBox();
    let e_box = element.getBoundingClientRect();
    let svg_box = svg.getBBox();
    //console.log(box)
    //console.log(e_box)
    //console.log(svg_box)
    const x = (e_box.x + e_box.width/2)  / svg_box.width
    const y = (e_box.y + e_box.height/2) / svg_box.height
    const filter_radius = Math.min(raw_e_box.width,raw_e_box.height)/2;
    console.log(`zooming (${x},${y}) ; filter radius (${filter_radius})`)
    deep_svg_xyz(embed,x,y,3)
    let g = element.closest("g")
    if(filter == "glow"){
        let glow = filters.create(svg,{type:"glow",color:"#c2feff",radius:filter_radius});
        let attach = ()=>{
            console.log("attaching")
            filters.attach(g,glow)
        }
        let detach = ()=>{
            console.log("detaching")
            filters.detach(g,glow)
        }
        setTimeout(attach ,2000)
        setTimeout(detach ,3000)
    }else{
        let glow_anim = filters.create(svg,{type:"glow_anim",color:"#c2feff",radius:filter_radius});
        console.log("starting")
        filters.start(g,glow_anim)
    }
}

//?svg=nrf52-sensor-tag&text=VEML6030
function deep_svg_text(embed,text){
    ['text','tspan'].forEach((ref_tag)=>{
        const svg = embed.getSVGDocument().getElementsByTagName('svg')[0]
        const elements = svg.getElementsByTagName(ref_tag);
        for(let element of elements){
            if(element.innerHTML == text){
                //filters.start(svg,tspan.parentElement.parentElement,glow_anim);
                console.log(`found text '${text}' in <${element.tagName}>`)
                text_highlight_zoom(embed,svg,element)
            }
        }
    })
}

function setup_svg_panzoom(embed){
    console.log("setup_svg_panzoom")
    const name = embed.id.substring(4)
    console.log(name)
    let params = {
        panEnabled: true,
        zoomEnabled: true,
        dblClickZoomEnabled: true,
        controlIconsEnabled: false,
        mouseWheelZoomEnabled: true,
        preventMouseEventsDefault: true,
        zoomScaleSensitivity: 0.6,
        minZoom: 0.5,
        maxZoom: 5,
        //onPan: (newPan)=>{console.log(newPan)},
        fit: true,
        contain: true,
        center: true,
        refreshRate: 'auto'
    };
    let svg_pz = svgPanZoom(`#${embed.id}`        ,params);
    window[`svgpz-${name}`] = svg_pz
    //handle deep linking
    if(window.location.search.startsWith('?')){
        let search = window.location.search.substring(1);
        let params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
        if(params.hasOwnProperty('svg')){
            if(params.svg == name){
                console.log(`Deep SVG Name Match`)
                embed.scrollIntoView();
                if(params.hasOwnProperty('x') && params.hasOwnProperty('y') && params.hasOwnProperty('z')){
                    console.log(`params : xyz = (${params.x},${params.y},${params.z})`)
                    deep_svg_xyz(embed,params.x,params.y,params.z)
                }else if(params.hasOwnProperty('text')){
                    console.log(`params text = ${params.text}`)
                    deep_svg_text(embed,params.text)
                }
            }
        }
    }

    let button = document.getElementById(`btn-${name}`);
    button.onclick = ()=>{
        var elem = document.getElementById(`svg-${name}`);
        if (elem.requestFullscreen) {
        elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
        }
    };
}

function reset_svg_panzoom(name){
    let svg_pz = window[`svgpz-${name}`]
    svg_pz.resize()
    svg_pz.fit()
    svg_pz.center()
}

export{
    setup_svg_panzoom,
    reset_svg_panzoom
};
