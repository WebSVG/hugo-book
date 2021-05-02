//https://github.com/bumbu/svg-pan-zoom
function setup_svg_panzoom(e){
    const name = e.target.id.substring(4)
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
        maxZoom: 4,
        //onPan: (newPan)=>{console.log(newPan)},
        fit: true,
        contain: true,
        center: true,
        refreshRate: 'auto'
    };
    let svg_pz = svgPanZoom(`#${e.target.id}`        ,params);
    window[`svgpz-${name}`] = svg_pz
    //handle deep linking
    //?svg=nrf52-sensor-tag&x=280&y=115&z=3.4#schematics
    if(window.location.search.startsWith('?')){
    let search = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    if(params.hasOwnProperty('svg')){
        let embed = e.target
        let viewport = embed.getSVGDocument().getElementsByClassName("svg-pan-zoom_viewport")[0]
        viewport.style.transition = "transform 1s ease"
        if(params.svg == name){
        console.log(`Deep SVG Name Match. link params ${JSON.stringify(params)}`)
        setTimeout(()=>{
            if(params.hasOwnProperty('x') && params.hasOwnProperty('y') && params.hasOwnProperty('z')){
            svg_pz.zoomAtPoint(params.z,{x:params.x, y:params.y},true)//absolute zoom value
            }
        },1000)
        setTimeout(()=>{
            viewport.style.transition = ""
        },2000)
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
