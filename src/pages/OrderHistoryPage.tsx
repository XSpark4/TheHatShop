import Header from "../components/Header";
import { useEffect, useState } from "react";
import { supabase } from "../services/supaBaseClient";
import { useUser } from "../contexts/UserContext";

function OrderHistoryPage() {
    const { user } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            const { data: orderData, error: orderError } = await supabase
                .from("SalesOrders")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (orderError) {
                console.error("Error loading orders:", orderError);
                return;
            }

            setOrders(orderData || []);

            const { data: itemData, error: itemError } = await supabase
                .from("SalesOrderItems")
                .select("*");

            if (itemError) {
                console.error("Error loading order items:", itemError);
                return;
            }

            setItems(itemData || []);
        };

        fetchOrders();
    }, [user]);

    const getItemsForOrder = (orderId: number) => {
        return items.filter((item) => item.order_id === orderId);
    };

    return (
        <div>
            <Header />
            <div style={{ marginLeft: "50px", marginRight: "50px", marginTop: "30px", marginBottom: "100px" }}>
                <h2 style={{ marginLeft: "0px" }}>Order History</h2>

                {orders.length === 0 ? (
                    <p>No orders yet.</p>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "20px",
                                marginBottom: "25px",
                                backgroundColor: "#fff"
                            }}
                        >
                            <h4>Order #{order.id}</h4>
                            <p>Status: {order.status || "completed"}</p>
                            <p>Date: {order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}</p>
                            <p>Subtotal: ${Number(order.subtotal || 0).toFixed(2)}</p>
                            <p>Tax: ${Number(order.tax || 0).toFixed(2)}</p>
                            <p><strong>Total: ${Number(order.total || 0).toFixed(2)}</strong></p>

                            <h5 style={{ marginTop: "20px" }}>Items</h5>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "left", paddingBottom: "10px" }}>Product</th>
                                        <th style={{ textAlign: "left", paddingBottom: "10px" }}>Price</th>
                                        <th style={{ textAlign: "left", paddingBottom: "10px" }}>Quantity</th>
                                        <th style={{ textAlign: "left", paddingBottom: "10px" }}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getItemsForOrder(order.id).map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ paddingBottom: "8px" }}>{item.product_name}</td>
                                            <td style={{ paddingBottom: "8px" }}>${Number(item.unit_price || 0).toFixed(2)}</td>
                                            <td style={{ paddingBottom: "8px" }}>{item.quantity}</td>
                                            <td style={{ paddingBottom: "8px" }}>${Number(item.line_total || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default OrderHistoryPage;