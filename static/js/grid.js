
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
    let main_element = that.main_div
    let scale = main_element.getAttribute("data-scale");
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
    main_element.setAttribute("data-scale",scale.toFixed(2));
    console.log(`scale = ${scale}`);
    const elements = main_element.children;
    const min_width = Math.round(main_element.getAttribute("data-side-min") * scale);
    //console.log(`id = ${main_element.id} ; min width= '${min_width}'`);
    main_element.style.gridTemplateColumns = `repeat(auto-fit, minmax(${min_width}px, 1fr))`;
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
        this.main_div = scale_grid(element,this.sheet);
        //console.log(JSON.stringify(this.main_div))
        that = this
    }

    set_div(div){
        let parent = this.main_div
        parent.appendChild(div)
        const side_size = parent.getAttribute("data-side-min");
        let width = div.getAttribute("data-width");
        let height = 150;
        div.setAttribute("data-height",height);
        const id = `div_${suid()}`;
        div.id = id;
        const width_span = Math.ceil(width/side_size);
        const height_span = Math.ceil(height/side_size);
        css(this.sheet,/*css*/`
        #${id} {
            width:${width};
            grid-column:span ${width_span};
            grid-row:span ${height_span};
            height:${height};
            background: rgb(48,54,60);
            align-self: top;
            justify-self: top;
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

        const side_size = this.main_div.getAttribute("data-side-min");
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
