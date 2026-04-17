import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/AdminLogin.css';
import { supabase } from '../services/supaBaseClient';

// Administrator/Analytics screen unlocked by a shared admin key.
type Product = {
    id: number;
    name: string;
    brand: string;
    description: string;
    image: string;
    stock: number;
    price: number;
};

type UserAccount = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    province: string;
    cardNumber: string;
    cardExpiry: string;
    cardSecurityNumber: string;
};

type SalesOrder = {
    id: string;
    user_id: string;
    created_at: string;
    subtotal: number;
    tax: number;
    total: number;
    shipping_address: string;
    shipping_city: string;
    shipping_zip: string;
    shipping_province: string;
};

type SalesOrderItem = {
    id: string;
    order_id: string;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
};

// Admin key must be provided via environment variable.
const adminKey = import.meta.env.VITE_ADMIN_KEY;

const emptyNewItem = {
    name: '',
    brand: '',
    description: '',
    image: '',
    stock: '0',
    price: '0',
};

function AdminLoginPage() {
    const navigate = useNavigate();
    const [keyInput, setKeyInput] = useState('');
    const [unlocked, setUnlocked] = useState(sessionStorage.getItem('adminUnlocked') === 'true');
    const [activeView, setActiveView] = useState<'sales' | 'inventory' | 'users'>('sales');

    // Sales view state (filters + selected order details).
    const [salesAvailable, setSalesAvailable] = useState(true);
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [orderItems, setOrderItems] = useState<SalesOrderItem[]>([]);
    const [salesUsers, setSalesUsers] = useState<UserAccount[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Inventory view state (stock/price update + add/remove items).
    const [products, setProducts] = useState<Product[]>([]);
    const [adjustments, setAdjustments] = useState<Record<number, { quantity: string; price: string }>>({});
    const [newItem, setNewItem] = useState(emptyNewItem);

    // User account maintenance state.
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userDraft, setUserDraft] = useState<UserAccount | null>(null);

    useEffect(() => {
        if (!unlocked) return;

        async function loadAdminData() {
            // After key unlock, load all datasets used in admin analytics tabs.
            const [productsRes, usersRes] = await Promise.all([
                supabase
                    .from('Products')
                    .select('id, name, brand, description, image, stock, price')
                    .order('id', { ascending: true }),
                supabase
                    .from('User')
                    .select('id, firstName, lastName, email, phone, address, city, zip, province, cardNumber, cardExpiry, cardSecurityNumber')
                    .order('firstName', { ascending: true }),
            ]);

            if (productsRes.error) {
                alert(productsRes.error.message);
                return;
            }

            if (usersRes.error) {
                alert(usersRes.error.message);
                return;
            }

            setProducts((productsRes.data ?? []) as Product[]);
            setUsers((usersRes.data ?? []) as UserAccount[]);
            setSalesUsers((usersRes.data ?? []) as UserAccount[]);

            // Sales tables are optional in case the DB has not been migrated yet.
            const [ordersRes, orderItemsRes] = await Promise.all([
                supabase
                    .from('SalesOrders')
                    .select('id, user_id, created_at, subtotal, tax, total, shipping_address, shipping_city, shipping_zip, shipping_province')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('SalesOrderItems')
                    .select('id, order_id, product_id, product_name, unit_price, quantity, line_total'),
            ]);

            if (ordersRes.error || orderItemsRes.error) {
                setSalesAvailable(false);
                return;
            }

            setSalesAvailable(true);
            setOrders((ordersRes.data ?? []) as SalesOrder[]);
            setOrderItems((orderItemsRes.data ?? []) as SalesOrderItem[]);
        }

        loadAdminData();
    }, [unlocked]);

    const userById = useMemo(() => {
        return salesUsers.reduce<Record<string, UserAccount>>((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }, [salesUsers]);

    const itemsByOrder = useMemo(() => {
        return orderItems.reduce<Record<string, SalesOrderItem[]>>((acc, item) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push(item);
            return acc;
        }, {});
    }, [orderItems]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const user = userById[order.user_id];
            const orderProducts = itemsByOrder[order.id] ?? [];
            const date = new Date(order.created_at);
            const customerText = `${user?.firstName ?? ''} ${user?.lastName ?? ''} ${user?.email ?? ''}`.toLowerCase();
            const productText = orderProducts.map((item) => item.product_name).join(' ').toLowerCase();

            const customerMatches = customerFilter ? customerText.includes(customerFilter.toLowerCase()) : true;
            const productMatches = productFilter ? productText.includes(productFilter.toLowerCase()) : true;
            const fromMatches = fromDate ? date >= new Date(`${fromDate}T00:00:00`) : true;
            const toMatches = toDate ? date <= new Date(`${toDate}T23:59:59`) : true;

            return customerMatches && productMatches && fromMatches && toMatches;
        });
    }, [orders, userById, itemsByOrder, customerFilter, productFilter, fromDate, toDate]);

    const selectedOrder = filteredOrders.find((order) => order.id === selectedOrderId) ?? null;
    const selectedOrderItems = selectedOrder ? itemsByOrder[selectedOrder.id] ?? [] : [];

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const text = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
            return text.includes(userSearch.toLowerCase());
        });
    }, [users, userSearch]);

    const selectedUserOrders = useMemo(() => {
        if (!selectedUserId) return [];
        return orders.filter((order) => order.user_id === selectedUserId);
    }, [orders, selectedUserId]);

    const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!adminKey) {
            alert('Admin key is not configured. Set VITE_ADMIN_KEY in your environment.');
            return;
        }

        if (keyInput.trim() !== adminKey) {
            alert('Invalid admin key');
            return;
        }

        sessionStorage.setItem('adminUnlocked', 'true');
        setUnlocked(true);
    };

    const handleLock = () => {
        sessionStorage.removeItem('adminUnlocked');
        setUnlocked(false);
        setKeyInput('');
        setActiveView('sales');
    };

    const handleUpdatePrice = async (product: Product) => {
        // Update product pricing from the inventory management tab.
        const draft = adjustments[product.id] || { quantity: '1', price: String(product.price) };
        const nextPrice = Number(draft.price);

        if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
            alert('Price must be greater than zero.');
            return;
        }

        const { error } = await supabase
            .from('Products')
            .update({ price: nextPrice })
            .eq('id', product.id);

        if (error) {
            alert(error.message);
            return;
        }

        setProducts((prev) => prev.map((item) => (item.id === product.id ? { ...item, price: nextPrice } : item)));
        alert('Price updated.');
    };

    const handleAdjustStock = async (product: Product, mode: 'add' | 'reduce') => {
        // Support explicit add/reduce quantity actions for inventory history workflows.
        const draft = adjustments[product.id] || { quantity: '1', price: String(product.price) };
        const quantity = Number(draft.quantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            alert('Quantity must be a positive number.');
            return;
        }

        const delta = mode === 'add' ? quantity : -quantity;
        const nextStock = product.stock + delta;

        if (nextStock < 0) {
            alert('Cannot reduce below zero stock.');
            return;
        }

        const { error } = await supabase
            .from('Products')
            .update({ stock: nextStock })
            .eq('id', product.id);

        if (error) {
            alert(error.message);
            return;
        }

        setProducts((prev) => prev.map((item) => (item.id === product.id ? { ...item, stock: nextStock } : item)));
        alert('Stock updated.');
    };

    const handleRemoveProduct = async (productId: number) => {
        // Remove an item from inventory entirely.
        const confirmDelete = window.confirm('Remove this item from inventory?');
        if (!confirmDelete) return;

        const { error } = await supabase.from('Products').delete().eq('id', productId);
        if (error) {
            alert(error.message);
            return;
        }

        setProducts((prev) => prev.filter((item) => item.id !== productId));
    };

    const handleAddProduct = async () => {
        // Add a new item to inventory from the administrator panel.
        const stock = Number(newItem.stock);
        const price = Number(newItem.price);

        if (!newItem.name || !newItem.brand || !newItem.description || !newItem.image) {
            alert('Please complete all new item fields.');
            return;
        }

        if (!Number.isFinite(stock) || stock < 0 || !Number.isFinite(price) || price <= 0) {
            alert('Stock must be zero or greater and price must be greater than zero.');
            return;
        }

        const { data, error } = await supabase
            .from('Products')
            .insert({
                name: newItem.name,
                brand: newItem.brand,
                description: newItem.description,
                image: newItem.image,
                stock,
                price,
            })
            .select('id, name, brand, description, image, stock, price')
            .single();

        if (error) {
            alert(error.message);
            return;
        }

        if (data) {
            setProducts((prev) => [...prev, data as Product]);
        }

        setNewItem(emptyNewItem);
    };

    const selectUserForEditing = (user: UserAccount) => {
        // Select account record for admin edits in the Users tab.
        setSelectedUserId(user.id);
        setUserDraft({ ...user });
    };

    const handleUpdateUser = async () => {
        if (!userDraft) return;

        const { error } = await supabase
            .from('User')
            .update({
                firstName: userDraft.firstName,
                lastName: userDraft.lastName,
                phone: userDraft.phone,
                address: userDraft.address,
                city: userDraft.city,
                zip: userDraft.zip,
                province: userDraft.province,
                cardNumber: userDraft.cardNumber,
                cardExpiry: userDraft.cardExpiry,
                cardSecurityNumber: userDraft.cardSecurityNumber,
            })
            .eq('id', userDraft.id);

        if (error) {
            alert(error.message);
            return;
        }

        setUsers((prev) => prev.map((u) => (u.id === userDraft.id ? userDraft : u)));
        setSalesUsers((prev) => prev.map((u) => (u.id === userDraft.id ? userDraft : u)));
        alert('User account updated.');
    };

    if (!unlocked) {
        return (
            <div>
                <Header />
                <div className="adminLoginPage">
                    {/* Admin key prompt shown before inventory tools are available. */}
                    <h2>Admin Login</h2>
                    <p>Enter the admin key to open the inventory management screen.</p>
                    {!adminKey && (
                        <p style={{ color: '#b02a37', marginTop: '8px' }}>
                            Admin access is not configured. Set <code>VITE_ADMIN_KEY</code> and rebuild.
                        </p>
                    )}
                    <form onSubmit={handleUnlock} className="adminLoginHeader">
                        <input
                            type="password"
                            className="form-control"
                            style={{ maxWidth: '320px' }}
                            placeholder="Admin key"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Unlock Admin</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Back to Catalog</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="adminLoginPage">
                {/* Top bar for locking the admin session or returning home. */}
                <div className="adminLoginHeader">
                    <h2 style={{ margin: 0 }}>Administrator / Analytics View</h2>
                    <button type="button" className="btn btn-warning" onClick={handleLock}>Lock Admin</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Back to Catalog</button>
                </div>

                {/* Admin feature selector for Sales, Inventory, and User Accounts. */}
                <div className="adminTabs">
                    <button type="button" className={`btn ${activeView === 'sales' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveView('sales')}>Sales History</button>
                    <button type="button" className={`btn ${activeView === 'inventory' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveView('inventory')}>Inventory</button>
                    <button type="button" className={`btn ${activeView === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveView('users')}>User Accounts</button>
                </div>

                {activeView === 'sales' && (
                    <div className="adminLoginGrid">
                        {!salesAvailable && (
                            <p>
                                Sales history tables are not available yet. Create `SalesOrders` and `SalesOrderItems` to enable this view.
                            </p>
                        )}
                        {salesAvailable && (
                            <>
                                {/* Sales filters: by customer, product, and date range. */}
                                <div className="adminFilters">
                                    <input type="text" placeholder="Filter by customer" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} />
                                    <input type="text" placeholder="Filter by product" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} />
                                    <label>
                                        From
                                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                                    </label>
                                    <label>
                                        To
                                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                                    </label>
                                </div>

                                <div className="adminSplit">
                                    <div>
                                        <table className="adminInventoryTable">
                                            <thead>
                                                <tr>
                                                    <th>Order</th>
                                                    <th>Date</th>
                                                    <th>Customer</th>
                                                    <th>Total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map((order) => {
                                                    const account = userById[order.user_id];
                                                    return (
                                                        <tr key={order.id}>
                                                            <td>{order.id}</td>
                                                            <td>{new Date(order.created_at).toLocaleString()}</td>
                                                            <td>{account ? `${account.firstName} ${account.lastName}` : 'Unknown user'}</td>
                                                            <td>${order.total.toFixed(2)}</td>
                                                            <td>
                                                                <button type="button" className="btn btn-sm btn-primary" onClick={() => setSelectedOrderId(order.id)}>
                                                                    Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="adminPanelCard">
                                        <h4>Order Details</h4>
                                        {!selectedOrder && <p>Select an order to see user/product details.</p>}
                                        {selectedOrder && (
                                            <>
                                                <p>
                                                    <strong>Order ID:</strong> {selectedOrder.id}
                                                    <br />
                                                    <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                                                    <br />
                                                    <strong>Customer:</strong> {userById[selectedOrder.user_id] ? `${userById[selectedOrder.user_id].firstName} ${userById[selectedOrder.user_id].lastName}` : 'Unknown'}
                                                </p>
                                                <table className="adminInventoryTable">
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Price</th>
                                                            <th>Qty</th>
                                                            <th>Line Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedOrderItems.map((item) => (
                                                            <tr key={item.id}>
                                                                <td>{item.product_name}</td>
                                                                <td>${item.unit_price.toFixed(2)}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>${item.line_total.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeView === 'inventory' && (
                    <div className="adminLoginGrid">
                        <div>
                            {/* Existing products can be edited in place here. */}
                            <h4>Current Items</h4>
                            <table className="adminInventoryTable">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Brand</th>
                                        <th>Stock</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => {
                                        const draft = adjustments[product.id] || { quantity: '1', price: String(product.price) };

                                        return (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.brand}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={draft.quantity}
                                                        onChange={(e) =>
                                                            setAdjustments((prev) => ({
                                                                ...prev,
                                                                [product.id]: {
                                                                    ...(prev[product.id] || { quantity: '1', price: String(product.price) }),
                                                                    quantity: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={draft.price}
                                                        onChange={(e) =>
                                                            setAdjustments((prev) => ({
                                                                ...prev,
                                                                [product.id]: {
                                                                    ...(prev[product.id] || { quantity: '1', price: String(product.price) }),
                                                                    price: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <button type="button" className="btn btn-sm btn-success" onClick={() => handleAdjustStock(product, 'add')}>
                                                        Add Qty
                                                    </button>{' '}
                                                    <button type="button" className="btn btn-sm btn-warning" onClick={() => handleAdjustStock(product, 'reduce')}>
                                                        Reduce Qty
                                                    </button>{' '}
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={() => handleUpdatePrice(product)}>
                                                        Save Price
                                                    </button>
                                                </td>
                                                <td>
                                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveProduct(product.id)}>
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            {/* New inventory items are added from this form. */}
                            <h4>Add New Item</h4>
                            <div className="adminInventoryForm">
                                <label>
                                    Name
                                    <input type="text" value={newItem.name} onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))} />
                                </label>
                                <label>
                                    Brand
                                    <input type="text" value={newItem.brand} onChange={(e) => setNewItem((prev) => ({ ...prev, brand: e.target.value }))} />
                                </label>
                                <label>
                                    Image Path
                                    <input type="text" value={newItem.image} onChange={(e) => setNewItem((prev) => ({ ...prev, image: e.target.value }))} />
                                </label>
                                <label>
                                    Price
                                    <input type="number" min="0.01" step="0.01" value={newItem.price} onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))} />
                                </label>
                                <label>
                                    Stock
                                    <input type="number" min="0" value={newItem.stock} onChange={(e) => setNewItem((prev) => ({ ...prev, stock: e.target.value }))} />
                                </label>
                                <label>
                                    Description
                                    <textarea rows={4} value={newItem.description} onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))} />
                                </label>
                            </div>
                            <br />
                            <button type="button" className="btn btn-primary" onClick={handleAddProduct}>
                                Add Item
                            </button>
                        </div>
                    </div>
                )}

                {activeView === 'users' && (
                    <div className="adminLoginGrid">
                        <div className="adminFilters">
                            <input
                                type="text"
                                placeholder="Search users by name or email"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                        </div>

                        <div className="adminSplit">
                            <div>
                                <table className="adminInventoryTable">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Orders</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => {
                                            const purchaseCount = orders.filter((order) => order.user_id === user.id).length;
                                            return (
                                                <tr key={user.id}>
                                                    <td>{user.firstName} {user.lastName}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.phone}</td>
                                                    <td>{purchaseCount}</td>
                                                    <td>
                                                        <button type="button" className="btn btn-sm btn-primary" onClick={() => selectUserForEditing(user)}>
                                                            Manage
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="adminPanelCard">
                                <h4>User Details</h4>
                                {!userDraft && <p>Select a user to update account information.</p>}
                                {userDraft && (
                                    <>
                                        <div className="adminInventoryForm">
                                            <label>
                                                First Name
                                                <input type="text" value={userDraft.firstName} onChange={(e) => setUserDraft({ ...userDraft, firstName: e.target.value })} />
                                            </label>
                                            <label>
                                                Last Name
                                                <input type="text" value={userDraft.lastName} onChange={(e) => setUserDraft({ ...userDraft, lastName: e.target.value })} />
                                            </label>
                                            <label>
                                                Phone
                                                <input type="text" value={userDraft.phone} onChange={(e) => setUserDraft({ ...userDraft, phone: e.target.value })} />
                                            </label>
                                            <label>
                                                Address
                                                <input type="text" value={userDraft.address} onChange={(e) => setUserDraft({ ...userDraft, address: e.target.value })} />
                                            </label>
                                            <label>
                                                City
                                                <input type="text" value={userDraft.city} onChange={(e) => setUserDraft({ ...userDraft, city: e.target.value })} />
                                            </label>
                                            <label>
                                                Province
                                                <input type="text" value={userDraft.province} onChange={(e) => setUserDraft({ ...userDraft, province: e.target.value })} />
                                            </label>
                                            <label>
                                                ZIP
                                                <input type="text" value={userDraft.zip} onChange={(e) => setUserDraft({ ...userDraft, zip: e.target.value })} />
                                            </label>
                                            <label>
                                                Card Number
                                                <input type="text" value={userDraft.cardNumber} onChange={(e) => setUserDraft({ ...userDraft, cardNumber: e.target.value })} />
                                            </label>
                                            <label>
                                                Card Expiry
                                                <input type="text" value={userDraft.cardExpiry} onChange={(e) => setUserDraft({ ...userDraft, cardExpiry: e.target.value })} />
                                            </label>
                                            <label>
                                                Security Number
                                                <input type="text" value={userDraft.cardSecurityNumber} onChange={(e) => setUserDraft({ ...userDraft, cardSecurityNumber: e.target.value })} />
                                            </label>
                                        </div>
                                        <br />
                                        <button type="button" className="btn btn-success" onClick={handleUpdateUser}>Update User</button>
                                        <hr />
                                        <h5>Purchase History</h5>
                                        <table className="adminInventoryTable">
                                            <thead>
                                                <tr>
                                                    <th>Order</th>
                                                    <th>Date</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUserOrders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td>{order.id}</td>
                                                        <td>{new Date(order.created_at).toLocaleString()}</td>
                                                        <td>${order.total.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLoginPage;
