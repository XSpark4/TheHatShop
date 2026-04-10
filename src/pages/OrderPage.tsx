import Header from "../components/Header";
import CartTableRow from "../components/CartTableRow";
import { useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { supabase } from "../services/supaBaseClient";

function OrderPage() {
    const { cart, clearCart } = useCart();
    const { user: currentUser, setUser } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const [orderItems] = useState(cart);

    const { charge, shipping, user } = location.state || {};
    const { firstName, lastName, email, phone } = user || {};
    const { address, city, zip, province } = shipping || {};
    const subtotal = Number(charge?.subtotal ?? 0);
    const tax = Number(charge?.tax ?? 0);
    const total = Number(charge?.total ?? 0);

    useEffect(() => {
        async function placeOrder() {
            try {
                // Save order header for administrator sales history reports.
                const { data: orderRow } = await supabase
                    .from('SalesOrders')
                    .insert({
                        user_id: currentUser?.id ?? null,
                        subtotal,
                        tax,
                        total,
                        shipping_address: address ?? '',
                        shipping_city: city ?? '',
                        shipping_zip: zip ?? '',
                        shipping_province: province ?? '',
                    })
                    .select('id')
                    .single();

                if (orderRow?.id) {
                    // Save line items so each order can show product-level details.
                    await supabase.from('SalesOrderItems').insert(
                        orderItems.map((item) => ({
                            order_id: orderRow.id,
                            product_id: item.id,
                            product_name: item.name,
                            unit_price: item.price,
                            quantity: item.qty,
                            line_total: item.price * item.qty,
                        }))
                    );
                }

                // Keep stock deduction behavior after placing an order.
                for (const item of orderItems) {
                    const { data } = await supabase
                        .from('Products')
                        .select('stock')
                        .eq('id', item.id)
                        .single();

                    const newStock = data!.stock - item.qty;

                    await supabase
                        .from('Products')
                        .update({ stock: newStock })
                        .eq('id', item.id);
                }
            } catch (error) {
                console.error("Error placing order:", error);
            }
        }
        placeOrder();
        clearCart();
    }, []);

    const handleLogout = () => {
        setUser(null);
        clearCart();
        alert("Successfully logged out.");
        navigate("/");
    };

    return (
        <div>
            <Header />
            <div>
                <h2 style={{ marginLeft: "0px" }}>Hello {firstName} {lastName}</h2>
                <p style={{ marginLeft: "50px" }}>Your order has been successfully placed. Thank you for shopping at The Hat Shop!</p>
            </div>
            <h2 style={{ marginLeft: "0px" }}>Your Order:</h2>
            <div className="cartContainer" style={{ marginLeft: "50px" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderItems.map((item) => <CartTableRow key={item.id} item={item} showRemove={false} />)}
                    </tbody>
                </table>
                <div className="text-end" style={{ paddingRight: "25px" }}>
                    <h6>Subtotal: ${subtotal.toFixed(2)}</h6>
                    <h6>+Tax: ${tax.toFixed(2)}</h6>
                    <h3>Grand Total: ${total.toFixed(2)}</h3>
                    <hr></hr>
                </div>
                <div>
                    <h3>Billed to:</h3>
                    <p>
                        {firstName} {lastName}<br></br>
                        {email}<br></br>
                        {phone}
                    </p>
                    <p>
                        {address} {city}, {province} {zip}<br></br>
                        Canada
                    </p>
                </div>
            </div><br></br>
            <div>
                <button className="btn btn-primary" style={{ marginLeft: "50px", marginBottom: "100px" }} onClick={() => navigate("/")}>Continue Shopping</button>
                <button className="btn btn-danger" style={{ marginLeft: "25px", marginBottom: "100px" }} onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default OrderPage;