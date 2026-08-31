// import { useState, useEffect } from 'react';
// import api from '../api/axios';
// import Layout from '../components/Layout';
// import toast from 'react-hot-toast';

// interface Item {
//   id: number;
//   code: string;
//   name: string;
//   category_name: string;
//   unit: string;
//   cost_price: number;
//   selling_price: number;
//   reorder_level: number;
//   stock_qty: number;
//   avg_cost: number;
// }

// const Inventory = () => {
//   const [items, setItems] = useState<Item[]>([]);
//   const [warehouses, setWarehouses] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'alerts'>('items');
//   const [movements, setMovements] = useState<any[]>([]);
//   const [alerts, setAlerts] = useState<any[]>([]);

//   // Form states
//   const [showForm, setShowForm] = useState(false);
//   const [itemName, setItemName] = useState('');
//   const [categoryId, setCategoryId] = useState('');
//   const [unit, setUnit] = useState('piece');
//   const [costPrice, setCostPrice] = useState('');
//   const [sellingPrice, setSellingPrice] = useState('');
//   const [reorderLevel, setReorderLevel] = useState('10');

//   // Movement form
//   const [showMovement, setShowMovement] = useState(false);
//   const [moveItemId, setMoveItemId] = useState('');
//   const [moveWarehouseId, setMoveWarehouseId] = useState('');
//   const [moveType, setMoveType] = useState('receive');
//   const [moveQty, setMoveQty] = useState('');
//   const [moveCost, setMoveCost] = useState('');
//   const [moveRef, setMoveRef] = useState('');

//   useEffect(() => {
//     fetchItems();
//     fetchWarehouses();
//     fetchCategories();
//     fetchMovements();
//     fetchAlerts();
//   }, []);

//   const fetchItems = async () => {
//     try {
//       const response = await api.get('/inventory/items');
//       setItems(response.data);
//     } catch (error) { toast.error('Failed to load items'); }
//     finally { setLoading(false); }
//   };

//   const fetchWarehouses = async () => {
//     const res = await api.get('/inventory/warehouses');
//     setWarehouses(res.data);
//   };

//   const fetchCategories = async () => {
//     const res = await api.get('/inventory/categories');
//     setCategories(res.data);
//   };

//   const fetchMovements = async () => {
//     const res = await api.get('/inventory/movements');
//     setMovements(res.data);
//   };

//   const fetchAlerts = async () => {
//     const res = await api.get('/inventory/reorder-alerts');
//     setAlerts(res.data);
//   };

//   const handleCreateItem = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await api.post('/inventory/items', {
//         name: itemName,
//         category_id: parseInt(categoryId),
//         unit,
//         cost_price: parseFloat(costPrice),
//         selling_price: parseFloat(sellingPrice),
//         reorder_level: parseInt(reorderLevel),
//       });
//       toast.success('Item created');
//       setShowForm(false);
//       setItemName(''); setCostPrice(''); setSellingPrice('');
//       fetchItems();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed');
//     }
//   };

//   const handleMovement = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await api.post('/inventory/movements', {
//         item_id: parseInt(moveItemId),
//         warehouse_id: parseInt(moveWarehouseId),
//         movement_type: moveType,
//         quantity: parseInt(moveQty),
//         unit_cost: parseFloat(moveCost) || 0,
//         reference: moveRef,
//       });
//       toast.success('Stock movement recorded');
//       setShowMovement(false);
//       setMoveQty(''); setMoveCost(''); setMoveRef('');
//       fetchItems();
//       fetchMovements();
//       fetchAlerts();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed');
//     }
//   };

//   const totalStockValue = items.reduce((sum, i) => sum + (i.stock_qty * i.avg_cost), 0);
//   const lowStockCount = alerts.length;

//   return (
//     <Layout>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
//         <p className="text-gray-500 mt-1 text-sm">Track stock, movements, and reorder alerts</p>
//       </div>

//       {/* Summary */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <div className="bg-white rounded-xl shadow-sm p-4 text-center">
//           <p className="text-sm text-gray-500">Total Items</p>
//           <p className="text-2xl font-bold text-gray-800">{items.length}</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 text-center">
//           <p className="text-sm text-gray-500">Stock Value</p>
//           <p className="text-2xl font-bold text-blue-900">₦{totalStockValue.toLocaleString()}</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm p-4 text-center">
//           <p className="text-sm text-gray-500">Low Stock Alerts</p>
//           <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockCount}</p>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2 mb-4">
//         <button onClick={() => setActiveTab('items')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'items' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
//           📦 Items
//         </button>
//         <button onClick={() => setActiveTab('movements')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'movements' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
//           🔄 Movements
//         </button>
//         <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
//           ⚠️ Reorder Alerts ({lowStockCount})
//         </button>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-2 mb-4">
//         <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Add Item</button>
//         <button onClick={() => setShowMovement(!showMovement)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">🔄 Stock Movement</button>
//       </div>

//       {/* Add Item Form */}
//       {showForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
//           <h3 className="font-semibold mb-4">Add New Item</h3>
//           <form onSubmit={handleCreateItem} className="grid grid-cols-2 md:grid-cols-6 gap-3">
//             <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item name" className="px-3 py-2 border rounded-lg text-sm" required />
//             <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" required>
//               <option value="">Category</option>
//               {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
//             </select>
//             <select value={unit} onChange={e => setUnit(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
//               <option value="piece">Piece</option>
//               <option value="box">Box</option>
//               <option value="pack">Pack</option>
//               <option value="kg">Kilogram</option>
//               <option value="litre">Litre</option>
//             </select>
//             <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="Cost (₦)" className="px-3 py-2 border rounded-lg text-sm" required />
//             <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="Selling (₦)" className="px-3 py-2 border rounded-lg text-sm" required />
//             <input type="number" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} placeholder="Reorder level" className="px-3 py-2 border rounded-lg text-sm" />
//             <button type="submit" className="col-span-2 md:col-span-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save Item</button>
//           </form>
//         </div>
//       )}

//       {/* Stock Movement Form */}
//       {showMovement && (
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
//           <h3 className="font-semibold mb-4">Record Stock Movement</h3>
//           <form onSubmit={handleMovement} className="grid grid-cols-2 md:grid-cols-6 gap-3">
//             <select value={moveItemId} onChange={e => setMoveItemId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" required>
//               <option value="">Item</option>
//               {items.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
//             </select>
//             <select value={moveWarehouseId} onChange={e => setMoveWarehouseId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" required>
//               <option value="">Warehouse</option>
//               {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
//             </select>
//             <select value={moveType} onChange={e => setMoveType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
//               <option value="receive">Receive</option>
//               <option value="issue">Issue</option>
//               <option value="adjust">Adjust</option>
//             </select>
//             <input type="number" value={moveQty} onChange={e => setMoveQty(e.target.value)} placeholder="Qty" className="px-3 py-2 border rounded-lg text-sm" required />
//             <input type="number" value={moveCost} onChange={e => setMoveCost(e.target.value)} placeholder="Unit cost" className="px-3 py-2 border rounded-lg text-sm" />
//             <input type="text" value={moveRef} onChange={e => setMoveRef(e.target.value)} placeholder="Reference" className="px-3 py-2 border rounded-lg text-sm" />
//             <button type="submit" className="col-span-2 md:col-span-6 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Record Movement</button>
//           </form>
//         </div>
//       )}

//       {/* Items Tab */}
//       {activeTab === 'items' && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="p-6 text-center">Loading...</div>
//           ) : items.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">No items yet. Add your first item.</div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left">Code</th>
//                   <th className="px-6 py-3 text-left">Name</th>
//                   <th className="px-6 py-3 text-left">Category</th>
//                   <th className="px-6 py-3 text-right">Cost</th>
//                   <th className="px-6 py-3 text-right">Selling</th>
//                   <th className="px-6 py-3 text-right">Stock</th>
//                   <th className="px-6 py-3 text-right">Value</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {items.map((item) => (
//                   <tr key={item.id}>
//                     <td className="px-6 py-3 font-medium text-blue-900">{item.code}</td>
//                     <td className="px-6 py-3">{item.name}</td>
//                     <td className="px-6 py-3 text-gray-600">{item.category_name}</td>
//                     <td className="px-6 py-3 text-right">₦{Number(item.cost_price).toLocaleString()}</td>
//                     <td className="px-6 py-3 text-right">₦{Number(item.selling_price).toLocaleString()}</td>
//                     <td className={`px-6 py-3 text-right font-medium ${item.stock_qty <= item.reorder_level ? 'text-red-600' : 'text-gray-800'}`}>
//                       {item.stock_qty}
//                     </td>
//                     <td className="px-6 py-3 text-right">₦{(item.stock_qty * item.avg_cost).toLocaleString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       )}

//       {/* Movements Tab */}
//       {activeTab === 'movements' && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           {movements.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">No movements yet</div>
//           ) : (
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left">Item</th>
//                   <th className="px-6 py-3 text-left">Warehouse</th>
//                   <th className="px-6 py-3 text-left">Type</th>
//                   <th className="px-6 py-3 text-right">Qty</th>
//                   <th className="px-6 py-3 text-left">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//              // In Inventory.tsx - Movements tab
// {movements.map((m: any) => (
//   <tr key={m.id}>
//     <td className="px-6 py-3">{m.item_name}</td>
//     <td className="px-6 py-3">{m.warehouse_name}</td>
//     <td className="px-6 py-3">
//       <span className={`px-2 py-1 text-xs rounded-full ${
//         m.movement_type === 'transfer_in' ? 'bg-blue-100 text-blue-800' :
//         m.movement_type === 'transfer_out' ? 'bg-purple-100 text-purple-800' :
//         m.movement_type === 'receive' ? 'bg-green-100 text-green-800' :
//         m.movement_type === 'issue' ? 'bg-red-100 text-red-800' : 
//         'bg-yellow-100 text-yellow-800'
//       }`}>{m.movement_type}</span>
//     </td>
//     <td className="px-6 py-3 text-right font-medium">{m.quantity}</td>
//     {m.source_warehouse && (
//       <td className="px-6 py-3 text-sm text-gray-500">
//         From: {m.source_warehouse} → To: {m.dest_warehouse}
//       </td>
//     )}
//     <td className="px-6 py-3 text-gray-600">{new Date(m.created_at).toLocaleDateString()}</td>
//   </tr>
// ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       )}

//       {/* Alerts Tab */}
//       {activeTab === 'alerts' && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           {alerts.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">✅ All items sufficiently stocked</div>
//           ) : (
//             <div className="p-6">
//               {alerts.map((a: any) => (
//                 <div key={a.id} className="flex justify-between items-center py-3 border-b">
//                   <div>
//                     <p className="font-medium">{a.name}</p>
//                     <p className="text-xs text-gray-500">{a.category_name}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-red-600 font-bold">{a.stock_qty} left</p>
//                     <p className="text-xs text-gray-400">Reorder at {a.reorder_level}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default Inventory;

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

interface Movement {
  id: number;
  item_name: string;
  warehouse_name: string;
  movement_type: string;
  quantity: number;
  source_warehouse?: string;
  dest_warehouse?: string;
  created_at: string;
}

const Inventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'alerts' | 'transfers'>('items');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);

  // Item Form states
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('piece');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [reorderLevel, setReorderLevel] = useState('10');

  // Movement form states
  const [showMovement, setShowMovement] = useState(false);
  const [moveItemId, setMoveItemId] = useState('');
  const [moveWarehouseId, setMoveWarehouseId] = useState('');
  const [moveType, setMoveType] = useState('receive');
  const [moveQty, setMoveQty] = useState('');
  const [moveCost, setMoveCost] = useState('');
  const [moveRef, setMoveRef] = useState('');

  // Transfer form states
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferItemId, setTransferItemId] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
    fetchCategories();
    fetchMovements();
    fetchAlerts();
    fetchTransfers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/items');
      setItems(response.data);
    } catch (error) { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/inventory/warehouses');
      setWarehouses(res.data);
    } catch (error) { toast.error('Failed to load warehouses'); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/inventory/categories');
      setCategories(res.data);
    } catch (error) { toast.error('Failed to load categories'); }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get('/inventory/movements');
      setMovements(res.data);
    } catch (error) { toast.error('Failed to load movements'); }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/inventory/reorder-alerts');
      setAlerts(res.data);
    } catch (error) { toast.error('Failed to load alerts'); }
  };

  const fetchTransfers = async () => {
    try {
      // Get all transfer movements (both in and out)
      const res = await api.get('/inventory/movements?limit=200');
      const transferMovements = res.data.filter((m: any) => 
        m.movement_type === 'transfer_in' || m.movement_type === 'transfer_out'
      );
      setTransfers(transferMovements);
    } catch (error) { toast.error('Failed to load transfers'); }
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
      setItemName('');
      setCostPrice('');
      setSellingPrice('');
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create item');
    }
  };

//   const handleMovement = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await api.post('/inventory/movements', {
//         item_id: parseInt(moveItemId),
//         warehouse_id: parseInt(moveWarehouseId),
//         movement_type: moveType,
//         quantity: parseInt(moveQty),
//         unit_cost: parseFloat(moveCost) || 0,
//         reference: moveRef,
//       });
//       toast.success('Stock movement recorded');
//       setShowMovement(false);
//       setMoveQty('');
//       setMoveCost('');
//       setMoveRef('');
//       fetchItems();
//       fetchMovements();
//       fetchAlerts();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to record movement');
//     }
//   };

const handleMovement = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (moveType === 'receive') {
      await api.post('/inventory/receive', {
        item_id: parseInt(moveItemId),
        warehouse_id: parseInt(moveWarehouseId),
        quantity: parseInt(moveQty),
        unit_cost: parseFloat(moveCost) || 0,
        reference: moveRef,
      });
    } else if (moveType === 'issue') {
      await api.post('/inventory/issue', {
        item_id: parseInt(moveItemId),
        warehouse_id: parseInt(moveWarehouseId),
        quantity: parseInt(moveQty),
        unit_cost: parseFloat(moveCost) || 0,
        reference: moveRef,
      });
    } else if (moveType === 'adjust') {
      await api.post('/inventory/adjust', {
        item_id: parseInt(moveItemId),
        warehouse_id: parseInt(moveWarehouseId),
        quantity: parseInt(moveQty),
        reason: moveRef,
      });
    }
    toast.success('Stock movement recorded');
    setShowMovement(false);
    setMoveQty('');
    setMoveCost('');
    setMoveRef('');
    fetchItems();
    fetchMovements();
    fetchAlerts();
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to record movement');
  }
};

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/transfer', {
        item_id: parseInt(transferItemId),
        from_warehouse_id: parseInt(fromWarehouseId),
        to_warehouse_id: parseInt(toWarehouseId),
        quantity: parseInt(transferQty),
        notes: transferNotes,
      });
      toast.success('Stock transferred successfully');
      setShowTransfer(false);
      setTransferQty('');
      setTransferNotes('');
      fetchItems();
      fetchMovements();
      fetchAlerts();
      fetchTransfers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to transfer stock');
    }
  };

  const totalStockValue = items.reduce((sum, i) => sum + (i.stock_qty * i.avg_cost), 0);
  const lowStockCount = alerts.length;

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <p className="text-gray-500 mt-1 text-sm">Track stock, movements, transfers, and reorder alerts</p>
      </div>

      {/* Summary Cards */}
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
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button 
          onClick={() => setActiveTab('items')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'items' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          📦 Items
        </button>
        <button 
          onClick={() => setActiveTab('movements')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'movements' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          🔄 Movements
        </button>
        <button 
          onClick={() => setActiveTab('transfers')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'transfers' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          📦 Transfers
        </button>
        <button 
          onClick={() => setActiveTab('alerts')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
          }`}
        >
          ⚠️ Alerts ({lowStockCount})
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + Add Item
        </button>
        <button 
          onClick={() => setShowMovement(!showMovement)} 
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
        >
          📥 Stock Movement
        </button>
        <button 
          onClick={() => setShowTransfer(!showTransfer)} 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
        >
          🔄 Transfer Stock
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold mb-4">Add New Item</h3>
          <form onSubmit={handleCreateItem} className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <input 
              type="text" 
              value={itemName} 
              onChange={e => setItemName(e.target.value)} 
              placeholder="Item name" 
              className="px-3 py-2 border rounded-lg text-sm" 
              required 
            />
            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm" 
              required
            >
              <option value="">Category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select 
              value={unit} 
              onChange={e => setUnit(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="piece">Piece</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
              <option value="kg">Kilogram</option>
              <option value="litre">Litre</option>
            </select>
            <input 
              type="number" 
              value={costPrice} 
              onChange={e => setCostPrice(e.target.value)} 
              placeholder="Cost (₦)" 
              className="px-3 py-2 border rounded-lg text-sm" 
              required 
            />
            <input 
              type="number" 
              value={sellingPrice} 
              onChange={e => setSellingPrice(e.target.value)} 
              placeholder="Selling (₦)" 
              className="px-3 py-2 border rounded-lg text-sm" 
              required 
            />
            <input 
              type="number" 
              value={reorderLevel} 
              onChange={e => setReorderLevel(e.target.value)} 
              placeholder="Reorder level" 
              className="px-3 py-2 border rounded-lg text-sm" 
            />
            <button 
              type="submit" 
              className="col-span-2 md:col-span-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Save Item
            </button>
          </form>
        </div>
      )}

      {/* Stock Movement Form */}
      {showMovement && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold mb-4">Record Stock Movement</h3>
          <form onSubmit={handleMovement} className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <select 
              value={moveItemId} 
              onChange={e => setMoveItemId(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm" 
              required
            >
              <option value="">Item</option>
              {items.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <select 
              value={moveWarehouseId} 
              onChange={e => setMoveWarehouseId(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm" 
              required
            >
              <option value="">Warehouse</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select 
              value={moveType} 
              onChange={e => setMoveType(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="receive">Receive</option>
              <option value="issue">Issue</option>
              <option value="adjust">Adjust</option>
            </select>
            <input 
              type="number" 
              value={moveQty} 
              onChange={e => setMoveQty(e.target.value)} 
              placeholder="Qty" 
              className="px-3 py-2 border rounded-lg text-sm" 
              required 
            />
            <input 
              type="number" 
              value={moveCost} 
              onChange={e => setMoveCost(e.target.value)} 
              placeholder="Unit cost" 
              className="px-3 py-2 border rounded-lg text-sm" 
            />
            <input 
              type="text" 
              value={moveRef} 
              onChange={e => setMoveRef(e.target.value)} 
              placeholder="Reference" 
              className="px-3 py-2 border rounded-lg text-sm" 
            />
            <button 
              type="submit" 
              className="col-span-2 md:col-span-6 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Record Movement
            </button>
          </form>
        </div>
      )}

      {/* Transfer Form */}
      {showTransfer && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold mb-4">Transfer Stock Between Warehouses</h3>
          <form onSubmit={handleTransfer} className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <select 
              value={transferItemId} 
              onChange={e => setTransferItemId(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm" 
              required
            >
              <option value="">Item</option>
              {items.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <select 
              value={fromWarehouseId} 
              onChange={e => setFromWarehouseId(e.target.value)} 
              className="px-3 py-2 border rounded-lg text-sm" 
              required
            >
              <option value="">From Warehouse</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
  <select 
  value={toWarehouseId} 
  onChange={e => setToWarehouseId(e.target.value)} 
  className="px-3 py-2 border rounded-lg text-sm" 
  required
>
  <option value="">To Warehouse</option>
  {warehouses
    .filter((w: any) => w.id.toString() !== fromWarehouseId)
    .map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
</select>
            <input 
              type="number" 
              value={transferQty} 
              onChange={e => setTransferQty(e.target.value)} 
              placeholder="Quantity" 
              className="px-3 py-2 border rounded-lg text-sm" 
              required 
            />
            <input 
              type="text" 
              value={transferNotes} 
              onChange={e => setTransferNotes(e.target.value)} 
              placeholder="Notes (optional)" 
              className="px-3 py-2 border rounded-lg text-sm col-span-2" 
            />
            <button 
              type="submit" 
              className="col-span-2 md:col-span-6 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Execute Transfer
            </button>
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
            <div className="overflow-x-auto">
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
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-blue-900">{item.code}</td>
                      <td className="px-6 py-3">{item.name}</td>
                      <td className="px-6 py-3 text-gray-600">{item.category_name || '-'}</td>
                      <td className="px-6 py-3 text-right">₦{Number(item.cost_price).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">₦{Number(item.selling_price).toLocaleString()}</td>
                      <td className={`px-6 py-3 text-right font-medium ${
                        item.stock_qty <= item.reorder_level ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {item.stock_qty || 0}
                      </td>
                      <td className="px-6 py-3 text-right">
                        ₦{((item.stock_qty || 0) * (item.avg_cost || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No movements yet</div>
          ) : (
            <div className="overflow-x-auto">
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
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{m.item_name}</td>
                      <td className="px-6 py-3">{m.warehouse_name}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          m.movement_type === 'receive' ? 'bg-green-100 text-green-800' :
                          m.movement_type === 'issue' ? 'bg-red-100 text-red-800' :
                          m.movement_type === 'transfer_in' ? 'bg-blue-100 text-blue-800' :
                          m.movement_type === 'transfer_out' ? 'bg-purple-100 text-purple-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium">{Math.abs(m.quantity)}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {transfers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No transfers yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Item</th>
                    <th className="px-6 py-3 text-left">From</th>
                    <th className="px-6 py-3 text-left">To</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transfers.filter(m => m.movement_type === 'transfer_in').map((m: any) => {
                    // Find the matching transfer_out for this transfer
                    const transferOut = transfers.find(
                      (t: any) => t.movement_number === m.movement_number && t.movement_type === 'transfer_out'
                    );
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium">{m.item_name}</td>
                        <td className="px-6 py-3">{transferOut?.warehouse_name || m.source_warehouse || '-'}</td>
                        <td className="px-6 py-3">{m.warehouse_name}</td>
                        <td className="px-6 py-3 text-right font-medium">{Math.abs(m.quantity)}</td>
                        <td className="px-6 py-3 text-gray-600">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                <div key={a.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{a.item_name}</p>
                    <p className="text-xs text-gray-500">{a.warehouse_name || 'All warehouses'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold">{a.current_quantity || 0} left</p>
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