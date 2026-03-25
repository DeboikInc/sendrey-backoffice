import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listUsers, exportUsers, updateUserStatus, bulkUserAction, deleteUser } from '../Redux/usersSlice';
import { Download, Ban, Trash2, CheckCircle, UserX, RefreshCw } from 'lucide-react';

export default function UsersList() {
    const dispatch = useDispatch();
    const { list: rawList, loading = false, error = null } = useSelector(state => state.users || {});
    const list = Array.isArray(rawList) ? rawList : [];

    const [selectedIds, setSelectedIds] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(listUsers());
    }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setSelectedIds([]);
        try {
            await dispatch(listUsers());
        } finally {
            setRefreshing(false);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkAction = (action) => {
        if (window.confirm(`Perform ${action} on ${selectedIds.length} users?`)) {
            dispatch(bulkUserAction({ userIds: selectedIds, action }));
            setSelectedIds([]);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black italic">USER ACCOUNTS</h1>
                    <p className="text-gray-400 text-sm">Manage and moderate customer accounts</p>

                    <div className="flex items-center gap-3 mt-5">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-bold disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => dispatch(exportUsers())}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* ── Error Banner ────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            )}

            {/* ── Bulk Action Bar ─────────────────────────────────────────────── */}
            {selectedIds.length > 0 && (
                <div className="bg-primary/20 border border-primary/40 p-3 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-bold ml-2">{selectedIds.length} users selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkAction('suspend')}
                            className="flex items-center gap-1 bg-black-200 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-400"
                        >
                            <Ban size={14} /> Suspend
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="flex items-center gap-1 bg-red-500 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-black border-b border-white/5">
                        <tr>
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    // ✅ Select-all uses _id
                                    checked={selectedIds.length === list.length && list.length > 0}
                                    onChange={(e) => setSelectedIds(e.target.checked ? list.map(u => u._id) : [])}
                                    className="accent-primary"
                                />
                            </th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Account Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.map(user => (
                            <tr
                                key={user._id}  // ✅ _id
                                className={`hover:bg-white/5 transition ${selectedIds.includes(user._id) ? 'bg-primary/5' : ''}`}
                            >
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(user._id)}  // ✅ _id
                                        onChange={() => handleSelect(user._id)}   // ✅ _id
                                        className="accent-primary"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                        user.status === 'Active'
                                            ? 'text-green-400 bg-green-400/10'
                                            : 'text-red-400 bg-red-400/10'
                                    }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => dispatch(updateUserStatus({
                                            userId: user._id,  // ✅ _id
                                            status: user.status === 'Active' ? 'Suspended' : 'Active'
                                        }))}
                                        className="text-gray-400 hover:text-white mr-4 transition-colors"
                                    >
                                        {user.status === 'Active' ? <UserX size={18} /> : <CheckCircle size={18} />}
                                    </button>
                                    <button
                                        onClick={() => dispatch(deleteUser(user._id))}  // ✅ _id
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Loading State ────────────────────────────────────────────── */}
                {loading && (
                    <div className="p-8 text-center text-gray-500">
                        Loading users...
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────────────── */}
                {!loading && !error && list.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
}