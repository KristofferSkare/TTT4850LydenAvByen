import { valueToColor } from "./ColorSvgOverlay";


const ColorScale=({colors}:{colors: string[]})=> {
    const resolution = 8*4 +1;
    const maxValue = 80;
    const minValue = 40;

    const usedColors = () => {
        const indexes = Array.from(new Array(resolution), (x, i) => i)
        return indexes.map((index) => {
            const value = maxValue - index*(maxValue- minValue)/(resolution-1)
            return {color: valueToColor(value, colors), value: value}
        }) 
    }
    return <div
        className="color-scale-container"
        >
        {usedColors().map(({color, value}, index) => {
            return <div className="color-scale-element" style={{height: 100/resolution + "%"}} key={index}>
                <div className="color-scale-element-color" style={{backgroundColor: color}}/>
                {index % (Math.round(resolution/8)) === 0 &&
                <div className="color-scale-element-text">{Math.round(value) + "dB"}</div>}
            </div>
        })}
       
    </div>
}

export default ColorScale