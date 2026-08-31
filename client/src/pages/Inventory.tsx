import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface Item {
  id: number;
  code: string;
  name: string;
  category_name: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  stock_qty: number;
  avg_cost: number;
}

const Inventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'alerts'>('items');
  const [movements, setMovements] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('piece');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [reorderLevel, setReorderLevel] = useState('10');

  // Movement form
  const [showMovement, setShowMovement] = useState(false);
  const [moveItemId, setMoveItemId] = useState('');
  const [moveWarehouseId, setMoveWarehouseId] = useState('');
  const [moveType, setMoveType] = useState('receive');
  const [moveQty, setMoveQty] = useState('');
  const [moveCost, setMoveCost] = useState('');
  const [moveRef, setMoveRef] = useState('');

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
    fetchCategories();
    fetchMovements();
    fetchAlerts();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/items');
      setItems(response.data);
    } catch (error) { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  const fetchWarehouses = async () => {
    const res = await api.get('/inventory/warehouses');
    setWarehouses(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get('/inventory/categories');
    setCategories(res.data);
  };

  const fetchMovements = async () => {
    const res = await api.get('/inventory/movements');
    setMovements(res.data);
  };

  const fetchAlerts = async () => {
    const res = await api.get('/inventory/reorder-alerts');
    setAlerts(res.data);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/items', {
        name: itemName,
        category_id: parseInt(categoryId),
        unit,
        cost_price: parseFloat(costPrice),
        selling_price: parseFloat(sellingPrice),
        reorder_level: parseInt(reorderLevel),
      });
      toast.success('Item created');
      setShowForm(false);
      setItemName(''); setCostPrice(''); setSellingPrice('');
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/movements', {
        item_id: parseInt(moveItemId),
        warehouse_id: parseInt(moveWarehouseId),
        movement_type: moveType,
        quantity: parseInt(moveQty),
        unit_cost: parseFloat(moveCost) || 0,
        reference: moveRef,
      });
      toast.success('Stock movement recorded');
      setShowMovement(false);
      setMoveQty(''); setMoveCost(''); setMoveRef('');
      fetchItems();
      fetchMovements();
      fetchAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const totalStockValue = items.reduce((sum, i) => sum + (i.stock_qty * i.avg_cost), 0);
  const lowStockCount = alerts.length;

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <p className="text-gray-500 mt-1 text-sm">Track stock, movements, and reorder alerts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Stock Value</p>
          <p className="text-2xl font-bold text-blue-900">₦{totalStockValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm text-gray-500">Low Stock Alerts</p>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'items' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          📦 Items
        </button>
        <button onClick={() => setActiveTab('movements')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'movements' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          🔄 Movements
        </button>
        <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          ⚠️ Reorder Alerts ({lowStockCount})
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Add Item</button>
        <button onClick={() => setShowMovement(!showMovement)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">🔄 Stock Movement</button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold mb-4">Add New Item</h3>
          <form onSubmit={handleCreateItem} className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item name" className="px-3 py-2 border rounded-lg text-sm" required />
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" required>
              <option value="">Category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={unit} onChange={e => setUnit(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="piece">Piece</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
              <option value="kg">Kilogram</option>
              <option value="litre">Litre</option>
            </select>
            <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="Cost (₦)" className="px-3 py-2 border rounded-lg text-sm" required />
            <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="Selling (₦)" className="px-3 py-2 border rounded-lg text-sm" required />
            <input type="number" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} placeholder="Reorder level" className="px-3 py-2 border rounded-lg text-sm" />
            <button type="submit" className="col-span-2 md:col-span-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save Item</button>
          </form>
        </div>
      )}

      {/* Stock Movement Form */}
      {showMovement && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold mb-4">Record Stock Movement</h3>
          <form onSubmit={handleMovement} className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <select value={moveItemId} onChange={e => setMoveItemId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" required>
              <option value="">Item</option>
              {items.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <select value={moveWarehouseId} onChange={e => setMoveWarehouseId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" required>
              <option value="">Warehouse</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select value={moveType} onChange={e => setMoveType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="receive">Receive</option>
              <option value="issue">Issue</option>
              <option value="adjust">Adjust</option>
            </select>
            <input type="number" value={moveQty} onChange={e => setMoveQty(e.target.value)} placeholder="Qty" className="px-3 py-2 border rounded-lg text-sm" required />
            <input type="number" value={moveCost} onChange={e => setMoveCost(e.target.value)} placeholder="Unit cost" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={moveRef} onChange={e => setMoveRef(e.target.value)} placeholder="Reference" className="px-3 py-2 border rounded-lg text-sm" />
            <button type="submit" className="col-span-2 md:col-span-6 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Record Movement</button>
          </form>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No items yet. Add your first item.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Code</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-right">Cost</th>
                  <th className="px-6 py-3 text-right">Selling</th>
                  <th className="px-6 py-3 text-right">Stock</th>
                  <th className="px-6 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 font-medium text-blue-900">{item.code}</td>
                    <td className="px-6 py-3">{item.name}</td>
                    <td className="px-6 py-3 text-gray-600">{item.category_name}</td>
                    <td className="px-6 py-3 text-right">₦{Number(item.cost_price).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">₦{Number(item.selling_price).toLocaleString()}</td>
                    <td className={`px-6 py-3 text-right font-medium ${item.stock_qty <= item.reorder_level ? 'text-red-600' : 'text-gray-800'}`}>
                      {item.stock_qty}
                    </td>
                    <td className="px-6 py-3 text-right">₦{(item.stock_qty * item.avg_cost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No movements yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Item</th>
                  <th className="px-6 py-3 text-left">Warehouse</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.map((m: any) => (
                  <tr key={m.id}>
                    <td className="px-6 py-3">{m.item_name}</td>
                    <td className="px-6 py-3">{m.warehouse_name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        m.movement_type === 'receive' ? 'bg-green-100 text-green-800' :
                        m.movement_type === 'issue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{m.movement_type}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium">{m.quantity}</td>
                    <td className="px-6 py-3 text-gray-600">{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">✅ All items sufficiently stocked</div>
          ) : (
            <div className="p-6">
              {alerts.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.category_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold">{a.stock_qty} left</p>
                    <p className="text-xs text-gray-400">Reorder at {a.reorder_level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Inventory;