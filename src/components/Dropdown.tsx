import { useState } from "react"

interface Props {
    options: string[];
    text: string;
    onSelect?: (selected: string) => void;
}

function Dropdown({ options, text, onSelect }: Props) {
    const [selected, setSelected] = useState(text);
    return (
        <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {selected}
            </button>
            <ul className="dropdown-menu">
                {options.map((option) => (
                    <li key={option}><a className="dropdown-item" href="#" onClick={(e) => {
                        e.preventDefault();
                        setSelected(option);
                        if (onSelect) onSelect(option);
                    }}>{option}</a></li>
                ))}
            </ul>
        </div>
    )
}

export default Dropdown;