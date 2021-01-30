
import {html,css,suid} from "/js/web-js-utils.js"

//restricting to a singleton (one instance), for easier parents retriaval
let that = null

function scale_grid(parent,sheet,props){
    const id = `div_${suid()}`;

    sheet.insertRule(/*css*/`
    #${id} {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(${props.grid_side}px, 1fr));
        grid-gap: 10px;
        align-items: top;
        justify-items: top;
    }
    `);
    let comp = html(parent,/*html*/`
        <div    id=${id} 
                class="main" 
                data-side-min=${props.grid_side} 
                data-max-sides=${props.max_sides} 
                data-scale="1" 
        />
    `);
    comp.addEventListener('wheel',onWheel);
    return comp;
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
     * @param {*} parent : parent element
     * @param {*} grid_side : slots unit to be used for the grid
     * @param {*} max_sides : max number of slots that an element can take, still only 2 is supported
     */
    constructor(parent,grid_side,max_sides=2){
        this.sheet = new CSSStyleSheet()
        this.main_div = scale_grid(parent,this.sheet,{grid_side:grid_side,max_sides:max_sides});
        //console.log(JSON.stringify(this.main_div))
        that = this
    }

    get_div(props){
        let parent = this.main_div
        const side_size = parent.getAttribute("data-side-min");
        const max_nb_sides = parent.getAttribute("data-max-sides");
        const width = props.width;
        const height = props.height;
        const id = `div_${suid()}`;
        const width_span = Math.ceil(width/side_size);
        const height_span = Math.ceil(height/side_size);
        css(this.sheet,/*css*/`
        #${id} {
            width:${width};
            grid-column:span ${width_span};
            grid-row:span ${height_span};
            height:${height};
            background: rgb(${props.r},${props.g},${props.b});
            //align-self: center;
            //justify-self: center;
        }
        `);
        let c_comp = html(parent,/*html*/`
            <div id=${id} class="child" data-width=${width} data-height=${height} />
        `);
        c_comp.addEventListener('wheel',onWheel);
        return c_comp;
    }

    set_div(div,config){
        let parent = this.main_div
        parent.appendChild(div)
        const side_size = parent.getAttribute("data-side-min");
        const width  = config.width;
        const height = config.height;
        div.setAttribute("data-width" ,config.width);
        div.setAttribute("data-height",config.height | 150);
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
