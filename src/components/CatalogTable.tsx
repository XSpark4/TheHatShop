
import '../styles/CatalogTable.css'
import { supabase } from '../services/supaBaseClient'
import { useEffect, useState } from 'react'

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
    useEffect(() => {
        async function fetchHats() {
            const { data, error } = await supabase.from('Products').select('*')
            if (error) console.error(error)
            else setHats(data)
        }
        fetchHats();
    }, [])

    return (
        <div className='tableContainer'>
            <h2>Catalog</h2>
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {hats.map(hat => (
                        <>
                        <tr key={hat.id}>
                            <td>Image</td>
                            <td>{hat.name}</td>
                            <td>{hat.brand}</td>
                            <td>${hat.price}</td>
                            <td>
                                <button type="button" className="btn btn-primary me-4">View Details</button>
                                <button type="button" className="btn btn-primary">Add to Cart</button>
                            </td>
                        </tr>
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default CatalogTable;