'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Save, Plus, Trash2, CalendarRange, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function getDaysText(dayOfWeek) {
  if (!dayOfWeek || dayOfWeek.length === 0) return 'No Days';
  if (dayOfWeek.length === 7) return 'All Days';
  if (dayOfWeek.length === 5 && !dayOfWeek.includes(0) && !dayOfWeek.includes(6)) return 'Weekdays';
  if (dayOfWeek.length === 2 && dayOfWeek.includes(0) && dayOfWeek.includes(6)) return 'Weekends';
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sortedDays = [...dayOfWeek].sort((a, b) => {
    const adjA = a === 0 ? 7 : a;
    const adjB = b === 0 ? 7 : b;
    return adjA - adjB;
  });
  return sortedDays.map(d => dayNames[d]).join(', ');
}

export default function PartnerSlots() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [basePrice, setBasePrice] = useState(120);
  const [slots, setSlots] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);

  // Bulk slot generator states
  const [bulkStart, setBulkStart] = useState('06:00');
  const [bulkEnd, setBulkEnd] = useState('22:00');
  const [bulkCapacity, setBulkCapacity] = useState(15);
  const [bulkDays, setBulkDays] = useState('all'); // 'all', 'weekdays', 'weekends', 'custom'
  const [bulkCustomDays, setBulkCustomDays] = useState([]);

  // New rule states
  const [newRuleStart, setNewRuleStart] = useState('06:00');
  const [newRuleEnd, setNewRuleEnd] = useState('09:00');
  const [newRuleMult, setNewRuleMult] = useState(1.5);
  const [newRuleDays, setNewRuleDays] = useState('weekdays'); // 'weekdays', 'weekends', 'all', 'custom'
  const [customDays, setCustomDays] = useState([]);

  useEffect(() => {
    async function loadGym() {
      try {
        const res = await fetch('/api/partner/gym', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setGym(data);
          setBasePrice(data.pricePerHour || 120);
          setSlots(data.slots || []);
          setPricingRules(data.pricingRules || []);
        }
      } catch (err) {
        addToast('Failed to load gym settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (session) loadGym();
  }, [session]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/partner/gym', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gym,
          pricePerHour: basePrice,
          slots,
          pricingRules
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setGym(updated);
        addToast('Gym settings saved successfully!', 'success');
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      addToast('Network error while saving', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Bulk Slot Generation Logic
  function handleBulkGenerate() {
    const startHour = parseInt(bulkStart.split(':')[0], 10);
    const endHour = parseInt(bulkEnd.split(':')[0], 10);
    
    if (isNaN(startHour) || isNaN(endHour) || startHour >= endHour) {
      addToast('Invalid hour ranges for bulk generation', 'error');
      return;
    }

    let slotDays = [0, 1, 2, 3, 4, 5, 6];
    if (bulkDays === 'weekdays') slotDays = [1, 2, 3, 4, 5];
    else if (bulkDays === 'weekends') slotDays = [0, 6];
    else if (bulkDays === 'custom') {
      if (bulkCustomDays.length === 0) {
        addToast('Please select at least one custom day for bulk generation', 'error');
        return;
      }
      slotDays = [...bulkCustomDays].sort();
    }

    const generated = [];
    for (let h = startHour; h < endHour; h++) {
      const slotStart = String(h).padStart(2, '0') + ':00';
      const slotEnd = String(h + 1).padStart(2, '0') + ':00';
      generated.push({
        time: `${slotStart} - ${slotEnd}`,
        capacity: Number(bulkCapacity),
        days: slotDays
      });
    }
    setSlots(generated);
    addToast(`Generated ${generated.length} hourly slots. Press Save to publish.`, 'info');
  }

  // Slots manager utilities
  function updateSlotCapacity(index, cap) {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, capacity: Number(cap) } : s));
  }

  function removeSlot(index) {
    setSlots(prev => prev.filter((_, i) => i !== index));
  }

  function addCustomSlot() {
    const defaultTime = '09:00 - 10:00';
    setSlots(prev => [...prev, { time: defaultTime, capacity: 15, days: [0, 1, 2, 3, 4, 5, 6] }]);
  }

  function updateSlotTime(index, val) {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, time: val } : s));
  }

  function updateSlotDays(index, days) {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, days } : s));
  }

  // Pricing rules utilities
  function addPricingRule() {
    let days = [];
    if (newRuleDays === 'weekdays') days = [1, 2, 3, 4, 5];
    else if (newRuleDays === 'weekends') days = [0, 6];
    else if (newRuleDays === 'all') days = [0, 1, 2, 3, 4, 5, 6];
    else if (newRuleDays === 'custom') {
      if (customDays.length === 0) {
        addToast('Please select at least one custom day', 'error');
        return;
      }
      days = [...customDays].sort();
    }

    const newRule = {
      dayOfWeek: days,
      startTime: newRuleStart,
      endTime: newRuleEnd,
      multiplier: Number(newRuleMult)
    };

    setPricingRules(prev => [...prev, newRule]);
    addToast('Dynamic pricing rule added. Press Save to publish.', 'info');
  }

  function removePricingRule(index) {
    setPricingRules(prev => prev.filter((_, i) => i !== index));
  }

  if (loading) return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading slots setup...</div>;
  if (!gym) return <div style={{ color: 'var(--red)', textAlign: 'center', padding: '40px' }}>Failed to retrieve Gym Settings.</div>;

  return (
    <motion.div initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Booking Rates & Availability</h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: BASE PRICE & DYNAMIC RULES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* BASE PRICE INPUT */}
          <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--red)" /> Base Hourly Price
            </h3>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Default Rate (₹ per hour)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>₹</span>
                <input 
                  type="number" 
                  className="auth-input" 
                  value={basePrice} 
                  onChange={e => setBasePrice(e.target.value)} 
                  style={{ width: '120px', padding: '10px 16px', fontSize: '1.2rem', fontWeight: 700 }} 
                />
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Charged for standard slot reservations.</span>
              </div>
            </div>
          </motion.div>

          {/* DYNAMIC TIME-OF-DAY PRICING RULES */}
          <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarRange size={18} color="var(--amber)" /> Dynamic Pricing Rules
            </h3>
            
            {/* Rules List */}
            {pricingRules.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>No dynamic pricing rules configured yet. Base rates will apply 24/7.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {pricingRules.map((rule, idx) => {
                  const daysText = getDaysText(rule.dayOfWeek);
                  const multiplierColor = rule.multiplier >= 1.0 ? 'var(--red)' : 'var(--green)';
                  return (
                    <div key={idx} style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>{daysText}</strong> • {rule.startTime} - {rule.endTime}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 800, color: multiplierColor }}>{rule.multiplier}x price</span>
                        <button style={{ background: 'none', color: 'var(--muted)', cursor: 'pointer' }} onClick={() => removePricingRule(idx)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Rule Form */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>Add Peak / Discount Rule</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="auth-input" value={newRuleStart} onChange={e => setNewRuleStart(e.target.value)} style={{ marginTop: '4px' }} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" className="auth-input" value={newRuleEnd} onChange={e => setNewRuleEnd(e.target.value)} style={{ marginTop: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Days</label>
                  <select className="auth-input" value={newRuleDays} onChange={e => setNewRuleDays(e.target.value)} style={{ marginTop: '4px' }}>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekends">Weekends (Sat-Sun)</option>
                    <option value="all">All Days (Mon-Sun)</option>
                    <option value="custom">Custom Days...</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Multiplier</label>
                  <input type="number" className="auth-input" value={newRuleMult} onChange={e => setNewRuleMult(e.target.value)} step="0.1" min="0.5" max="3" style={{ marginTop: '4px' }} />
                </div>
              </div>

              {newRuleDays === 'custom' && (
                <div className="form-group">
                  <label style={{ marginBottom: '8px', display: 'block' }}>Select Custom Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Mon', val: 1 },
                      { label: 'Tue', val: 2 },
                      { label: 'Wed', val: 3 },
                      { label: 'Thu', val: 4 },
                      { label: 'Fri', val: 5 },
                      { label: 'Sat', val: 6 },
                      { label: 'Sun', val: 0 },
                    ].map(day => {
                      const isSelected = customDays.includes(day.val);
                      return (
                        <button
                          key={day.val}
                          type="button"
                          onClick={() => {
                            setCustomDays(prev => 
                              prev.includes(day.val) 
                                ? prev.filter(d => d !== day.val) 
                                : [...prev, day.val]
                            );
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid var(--red)' : '1px solid var(--card-border)',
                            background: isSelected ? 'rgba(255, 76, 76, 0.1)' : 'var(--surface-alt)',
                            color: isSelected ? 'var(--red)' : 'var(--text)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button className="btn-outline" onClick={addPricingRule} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', height: '44px', borderRadius: '10px' }}>
                <Plus size={16} /> Add Pricing Rule
              </button>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: SLOTS MANAGER & BULK GENERATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* BULK SLOT GENERATOR */}
          <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--blue)" /> Bulk Availability Creator
            </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>Open Hour</label>
                <input type="time" className="auth-input" value={bulkStart} onChange={e => setBulkStart(e.target.value)} style={{ marginTop: '4px' }} />
              </div>
              <div className="form-group">
                <label>Close Hour</label>
                <input type="time" className="auth-input" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} style={{ marginTop: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>Days</label>
                <select className="auth-input" value={bulkDays} onChange={e => setBulkDays(e.target.value)} style={{ marginTop: '4px' }}>
                  <option value="all">All Days (Mon-Sun)</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekends">Weekends (Sat-Sun)</option>
                  <option value="custom">Custom Days...</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacity Threshold</label>
                <input type="number" className="auth-input" value={bulkCapacity} onChange={e => setBulkCapacity(e.target.value)} style={{ marginTop: '4px' }} />
              </div>
            </div>

            {bulkDays === 'custom' && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ marginBottom: '8px', display: 'block' }}>Select Custom Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { label: 'Mon', val: 1 },
                    { label: 'Tue', val: 2 },
                    { label: 'Wed', val: 3 },
                    { label: 'Thu', val: 4 },
                    { label: 'Fri', val: 5 },
                    { label: 'Sat', val: 6 },
                    { label: 'Sun', val: 0 },
                  ].map(day => {
                    const isSelected = bulkCustomDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        type="button"
                        onClick={() => {
                          setBulkCustomDays(prev => 
                            prev.includes(day.val) 
                              ? prev.filter(d => d !== day.val) 
                              : [...prev, day.val]
                          );
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid var(--red)' : '1px solid var(--card-border)',
                          background: isSelected ? 'rgba(255, 76, 76, 0.1)' : 'var(--surface-alt)',
                          color: isSelected ? 'var(--red)' : 'var(--text)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="btn-outline" onClick={handleBulkGenerate} style={{ width: '100%', height: '44px', borderRadius: '10px' }}>
              Generate Standard Hourly Slots
            </button>
          </motion.div>

          {/* ACTIVE SLOTS LIST */}
          <motion.div variants={itemVariants} className="detail-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Active Booking Slots ({slots.length})</h3>
              <button className="btn-outline" onClick={addCustomSlot} style={{ padding: '6px 12px', fontSize: '0.85rem', height: 'auto', borderRadius: '8px' }}>
                + Custom Slot
              </button>
            </div>

            {slots.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px' }}>No active booking slots. Generate standard slots above to open bookings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {slots.map((slot, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface-alt)', border: '1px solid var(--line)', padding: '14px 16px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={slot.time} 
                        onChange={e => updateSlotTime(idx, e.target.value)} 
                        style={{ padding: '6px 12px', flex: 1, fontSize: '0.9rem' }} 
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Cap:</span>
                        <input 
                          type="number" 
                          className="auth-input" 
                          value={slot.capacity} 
                          onChange={e => updateSlotCapacity(idx, e.target.value)} 
                          style={{ padding: '6px 10px', width: '56px', fontSize: '0.9rem', textAlign: 'center' }} 
                        />
                      </div>
                      <button style={{ background: 'none', color: 'var(--red)', cursor: 'pointer', border: 'none' }} onClick={() => removeSlot(idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Days selector */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginRight: '4px' }}>Days:</span>
                      {[
                        { label: 'M', val: 1 },
                        { label: 'T', val: 2 },
                        { label: 'W', val: 3 },
                        { label: 'T', val: 4 },
                        { label: 'F', val: 5 },
                        { label: 'S', val: 6 },
                        { label: 'S', val: 0 },
                      ].map(day => {
                        const slotDays = slot.days || [0,1,2,3,4,5,6];
                        const isSelected = slotDays.includes(day.val);
                        return (
                          <button
                            key={day.val}
                            type="button"
                            onClick={() => {
                              const newDays = isSelected 
                                ? slotDays.filter(d => d !== day.val)
                                : [...slotDays, day.val];
                              updateSlotDays(idx, newDays);
                            }}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: isSelected ? '1px solid var(--red)' : '1px solid var(--card-border)',
                              background: isSelected ? 'rgba(255, 76, 76, 0.1)' : 'var(--surface)',
                              color: isSelected ? 'var(--red)' : 'var(--muted)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                            }}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>

      </div>

    </motion.div>
  );
}
