import type { CartItem } from '../contexts/CartContext'
import { useCart } from '../contexts/CartContext'

type Props = {
    item: CartItem;
    showRemove: boolean;
}

function CartTableRow({ item, showRemove = true } : Props)
{
    const { removeFromCart } = useCart();
    const handleRemove = () => {
        removeFromCart(item.id);
    }

    const total = item.price * item.qty;
    return(
        <tr>
            <td>
                <img src={item.img} alt={item.name}/>
            </td>
            <td>{item.name}</td>
            <td>{item.brand}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>{item.qty}</td>
            <td>${total.toFixed(2)}</td>
            {showRemove === true ? (
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <button className="btn btn-danger" onClick={() => {handleRemove()}}>Remove</button>
                    </td>
            ) : (
                <td></td>
            )}
        </tr>
    );
}

export default CartTableRow;