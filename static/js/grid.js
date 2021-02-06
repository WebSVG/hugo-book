
import {css,suid} from "/js/web-js-utils.js"

//restricting to a singleton (one instance), for easier parents retriaval
let that = null

function scale_grid(element,sheet){
    const id = element.id;
    let grid_side = element.getAttribute("data-side-min")
    sheet.insertRule(/*css*/`
    #${id} {
        grid-template-columns: repeat(auto-fit, minmax(${grid_side}px, 1fr));
    }
    `);
    element.addEventListener('wheel',onWheel);
    return element;
}


function onWheel(e){
    if(!e.shiftKey){
        return;
    }
    console.log(`wheel on ${e.target.tagName} : ${e.target.id}`)
    let grid_div = that.grid_div
    let scale = grid_div.getAttribute("data-scale");
    const min_scale = 0.5;
    const max_scale = 2;
    if(e.deltaY > 0){
        scale = scale / 1.2;
    }else if (e.deltaY < 0){
        scale = scale * 1.2;
    }
    if(scale > max_scale){
        scale = max_scale;
    }else if(scale < min_scale){
        scale = min_scale;
    }
    grid_div.setAttribute("data-scale",scale.toFixed(2));
    console.log(`scale = ${scale}`);
    const elements = grid_div.children;
    const min_width = Math.round(grid_div.getAttribute("data-side-min") * scale);
    //console.log(`id = ${grid_div.id} ; min width= '${min_width}'`);
    grid_div.style.gridTemplateColumns = `repeat(auto-fit, minmax(${min_width}px, 1fr))`;
    for(let i=0;i<elements.length;i++){
        const element = elements[i];
        element.style.width = element.getAttribute("data-width") * scale;
        element.style.height = element.getAttribute("data-height") * scale;
    }
    e.preventDefault();
    e.stopPropagation();
}

class Grid{
    /**
     * 
     * @param {*} element : already created grid element
     */
    constructor(element){
        this.sheet = new CSSStyleSheet()
        this.grid_div = scale_grid(element,this.sheet);
        //console.log(JSON.stringify(this.grid_div))
        that = this
    }

    scale_card(div){
        const side_size = this.grid_div.getAttribute("data-side-min");
        let width = div.getAttribute("data-width");
        let height = div.getAttribute("data-height");
        const id = `div_${suid()}`;
        div.id = id;
        const width_span = Math.ceil(width/side_size);
        const height_span = Math.ceil(height/side_size);
        css(this.sheet,/*css*/`
        #${id} {
            grid-column:span ${width_span};
            grid-row:span ${height_span};
        }
        `);
        div.addEventListener('wheel',onWheel);
        return div;
    }


    resize(element,width,height){
        element.setAttribute("data-width",width)
        element.setAttribute("data-height",height)
        element.style.width = width;
        element.style.height = height;

        const side_size = this.grid_div.getAttribute("data-side-min");
        const width_span = Math.ceil(width/side_size);
        const height_span = Math.ceil(height/side_size);
        element.style.gridColumn = `span ${width_span}`;
        element.style.gridRow = `span ${height_span}`;
    }

    apply(){
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.sheet];
    }
    
}


export{Grid};
