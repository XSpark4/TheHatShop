
import '../styles/CatalogTable.css'
import { supabase } from '../services/supaBaseClient'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dropdown from '../components/Dropdown'

type Hat = {
    id: number;
    name: string;
    brand: string;
    description: string;
    image: string;
    stock: number;
    price: number;
}

function CatalogTable() {
    const [hats, setHats] = useState<Hat[]>([]);
    let filterOptions = ["Name", "Brand", "Price"]
    let sortingOptions = ["Ascending", "Descending"]

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState("Name");
    const [selectedDirection, setSelectedDirection] = useState("Ascending");

    const navigate = useNavigate();
    const clickHandler = (id: number, buttonType: string) => {
        if(buttonType === "View Details"){
            navigate(`/product/${id}`);
        }
        else{
            {/*TODO*/}
        }
    }  
    async function fetchHats(sortBy = "name", ascending = true, search='') {
        let query = supabase.from('Products').select('*');

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query.order(sortBy.toLowerCase(), { ascending });

        if (error) console.error(error);
        else setHats(data);
    }

    useEffect(() => {
        fetchHats();
    }, [])

    return (
        <div>
            <h2 style={{paddingLeft:"40px"}}>Browse our Catalog</h2>
            <div className='tableContainer'>
                <div className="d-flex gap-2 align-items-center">
                    <Dropdown text={selectedSort} options={filterOptions} onSelect={(value) => setSelectedSort(value)}/>
                    <Dropdown text={selectedDirection} options={sortingOptions} onSelect={(value) => setSelectedDirection(value)}/>
                    <input type="text" placeholder="Search by name..." className="form-control" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ maxWidth: "250px" }}/>
                    <button type="button" className="btn btn-primary" onClick={() =>
                        fetchHats(selectedSort, selectedDirection === "Ascending", searchQuery)
                    }>
                    Apply Filter</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th></th>
                            <th></th>
                            <th style={{textAlign: "right", paddingRight: "45px"}}>More Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hats.map(hat => (
                            <tr key={hat.id}>
                                <td><img src={hat.image} alt={hat.name}/></td>
                                <td>{hat.name}</td>
                                <td>{hat.brand}</td>
                                <td>${hat.price.toFixed(2)}</td>
                                <td></td>
                                <td></td>
                                <td className="text-end">
                                    <button type="button" className="btn btn-primary me-4" onClick={() => clickHandler(hat.id, "View Details")}>View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br></br>
                <br></br>
            </div>
        </div>
    )
}

export default CatalogTable;