import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ChevronLeft, 
  Trash2, 
  Plus,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AllocationRule {
  id: number;
  role: string;
  minClasses: number;
  maxClasses: number;
  notes: string;
}

export default function AllocationRules() {
  // Sample initial rules
  const [rules, setRules] = useState<AllocationRule[]>([
    { id: 1, role: 'Teacher', minClasses: 3, maxClasses: 6, notes: 'Standard teaching load' },
    { id: 2, role: 'Head of Department', minClasses: 2, maxClasses: 4, notes: 'Reduced load due to administrative duties' },
    { id: 3, role: 'Deputy Principal', minClasses: 1, maxClasses: 2, notes: 'Limited teaching due to leadership responsibilities' }
  ]);

  const [newRule, setNewRule] = useState<Omit<AllocationRule, 'id'>>({
    role: '',
    minClasses: 1,
    maxClasses: 5,
    notes: ''
  });

  const handleAddRule = () => {
    if (!newRule.role) {
      toast.error('Role name is required');
      return;
    }

    if (newRule.minClasses < 0 || newRule.maxClasses < 0) {
      toast.error('Class counts cannot be negative');
      return;
    }

    if (newRule.minClasses > newRule.maxClasses) {
      toast.error('Minimum classes cannot exceed maximum classes');
      return;
    }

    const newId = Math.max(0, ...rules.map(r => r.id)) + 1;
    setRules([...rules, { ...newRule, id: newId }]);
    
    // Reset form
    setNewRule({
      role: '',
      minClasses: 1,
      maxClasses: 5,
      notes: ''
    });

    toast.success('New role added successfully');
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.success('Role removed successfully');
  };

  const handleUpdateRule = (id: number, field: keyof Omit<AllocationRule, 'id'>, value: string | number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleSaveChanges = () => {
    // In a real app, this would make an API call to save the rules
    toast.success('Allocation rules updated successfully');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Users className="h-8 w-8" />
              <span className="text-xl font-bold">What-If Community</span>
            </Link>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold text-white">Manage Allocation Rules</h1>
            </div>
            
            <Link 
              to="/allocate-teachers"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Allocation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Description */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Info className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-lg">
                Set how many classes each teacher role can be allocated to. You can add or remove roles based on your school's structure.
              </p>
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Allocation Rules</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white">Role</th>
                  <th className="text-left p-4 text-white">Min Classes</th>
                  <th className="text-left p-4 text-white">Max Classes</th>
                  <th className="text-left p-4 text-white">Notes</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <input
                        type="text"
                        value={rule.role}
                        onChange={(e) => handleUpdateRule(rule.id, 'role', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={rule.minClasses}
                        onChange={(e) => handleUpdateRule(rule.id, 'minClasses', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={rule.maxClasses}
                        onChange={(e) => handleUpdateRule(rule.id, 'maxClasses', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={rule.notes}
                        onChange={(e) => handleUpdateRule(rule.id, 'notes', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                        placeholder="Optional notes"
                      />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Role */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Add New Role</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Role</label>
              <input
                type="text"
                value={newRule.role}
                onChange={(e) => setNewRule({ ...newRule, role: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Min Classes</label>
              <input
                type="number"
                min="0"
                value={newRule.minClasses}
                onChange={(e) => setNewRule({ ...newRule, minClasses: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Max Classes</label>
              <input
                type="number"
                min="0"
                value={newRule.maxClasses}
                onChange={(e) => setNewRule({ ...newRule, maxClasses: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Notes</label>
              <input
                type="text"
                value={newRule.notes}
                onChange={(e) => setNewRule({ ...newRule, notes: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="Optional notes"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddRule}
              className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveChanges}
            className="px-6 py-3 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}