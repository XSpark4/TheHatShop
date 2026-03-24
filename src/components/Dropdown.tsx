interface Props {
    options: string[];
    text: string;
    onSelect?: (selected: string) => void;
}

function Dropdown({ options, text, onSelect }: Props) {
    return (
        <div className="dropdown">
            <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {text} {/* controlled by parent */}
            </button>
            <ul className="dropdown-menu">
                {options.map((option) => (
                    <li key={option}>
                        <a
                            className="dropdown-item"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (onSelect) onSelect(option); // tell parent about selection
                            }}
                        >
                            {option}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dropdown;