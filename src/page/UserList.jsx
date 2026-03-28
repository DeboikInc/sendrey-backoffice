import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listUsers, exportUsers, updateUserStatus, bulkUserAction, deleteUser } from '../Redux/usersSlice';
import { Download, Ban, Trash2, CheckCircle, UserX, RefreshCw, AlertTriangle } from 'lucide-react';

export default function UsersList() {
  const dispatch = useDispatch();
  const { list: rawList, loading = false, error = null } = useSelector(state => state.users || {});
  const list = Array.isArray(rawList) ? rawList : [];

  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshing, setRefreshing]   = useState(false);

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
    <div className="px-6 py-8 space-y-6 bg-navy min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">User Accounts</h1>
          <p className="text-white/40 text-sm mt-1">Manage and moderate customer accounts</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/80 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <button
          onClick={() => dispatch(exportUsers())}
          className="self-start flex items-center gap-2 bg-royal/10 text-royal border border-royal/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-royal hover:text-white transition-all"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="bg-orange/10 border border-orange/20 px-4 py-3 rounded-xl flex justify-between items-center">
          <span className="text-orange text-sm font-medium">{selectedIds.length} users selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('suspend')}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-all"
            >
              <Ban size={13} /> Suspend
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-1.5 bg-crimson/10 border border-crimson/20 px-3 py-1.5 rounded-lg text-xs font-medium text-crimson hover:bg-crimson hover:text-white transition-all"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === list.length && list.length > 0}
                  onChange={(e) => setSelectedIds(e.target.checked ? list.map(u => u._id) : [])}
                  className="accent-orange"
                />
              </th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Customer</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Status</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {list.map(user => (
              <tr
                key={user._id}
                className={`hover:bg-white/5 transition-all ${selectedIds.includes(user._id) ? 'bg-orange/5' : ''}`}
              >
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user._id)}
                    onChange={() => handleSelect(user._id)}
                    className="accent-orange"
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="text-white font-medium text-sm">{user.name}</div>
                  <div className="text-white/35 text-xs mt-0.5">{user.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                    user.status === 'Active'
                      ? 'bg-purple/10 text-purple border-purple/20'
                      : 'bg-crimson/10 text-crimson border-crimson/20'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch(updateUserStatus({
                        userId: user._id,
                        status: user.status === 'Active' ? 'Suspended' : 'Active'
                      }))}
                      className="text-white/30 hover:text-white transition-colors"
                      title={user.status === 'Active' ? 'Suspend' : 'Activate'}
                    >
                      {user.status === 'Active' ? <UserX size={17} /> : <CheckCircle size={17} />}
                    </button>
                    <button
                      onClick={() => dispatch(deleteUser(user._id))}
                      className="text-white/30 hover:text-crimson transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-10 text-center text-white/30 text-sm">Loading users...</div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="p-10 text-center text-white/30 text-sm">No users found</div>
        )}
      </div>
    </div>
  );
}