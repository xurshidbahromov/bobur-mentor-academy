import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Loader2, Coins, Search, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminPayments() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null) // id of request being processed

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data, error } = await supabase
      .from('coin_requests')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error("So'rovlarni yuklashda xatolik: " + error.message)
    } else {
      setRequests(data)
    }
    setLoading(false)
  }

  async function handleApprove(request) {
    if (!confirm(`Tasdiqlaysizmi? Mijozga ${request.package_coins} coin beriladi.`)) return;
    setProcessing(request.id)

    try {
      const { data, error } = await supabase.rpc('approve_coin_request', { 
        p_request_id: request.id 
      })

      if (error) throw error

      toast.success(`Muvaffaqiyatli tasdiqlandi! Coin tushirildi.`)
      fetchRequests()
    } catch (err) {
       toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(request) {
    if (!confirm('Ushbu to\'lov so\'rovini bekor qilasizmi?')) return;
    setProcessing(request.id)

    const { error } = await supabase
      .from('coin_requests')
      .update({ status: 'rejected' })
      .eq('id', request.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("So'rov rad etildi.")
      fetchRequests()
    }
    setProcessing(null)
  }

  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> Kutilmoqda</span>
    }
    if (status === 'approved') {
      return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12}/> Tasdiqlangan</span>
    }
    return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={12}/> Rad etilgan</span>
  }

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={32} className="spin" color="#3461FF" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800 }}>To'lov So'rovlari</h1>
          <p style={{ margin: 0, color: '#94A3B8' }}>Foydalanuvchilarning kartaga o'tkazgan to'lovlarini tasdiqlang</p>
        </div>
      </div>

      <div style={{ background: '#1E293B', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <FileText size={48} color="#334155" style={{ marginBottom: 16 }} />
            <p style={{ color: '#94A3B8', fontWeight: 500 }}>Hozircha to'lov so'rovlari yo'q</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Mijoz</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Paket (Coin)</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Summa</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>Holat</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#334155', overflow: 'hidden' }}>
                          {req.profiles?.avatar_url 
                            ? <img src={req.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '0.875rem', fontWeight: 700 }}>{req.profiles?.full_name?.[0] || 'U'}</div>
                          }
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '0.875rem' }}>{req.profiles?.full_name || 'Noma\'lum'}</p>
                          <p style={{ margin: 0, color: '#64748B', fontSize: '0.75rem' }}>{new Date(req.created_at).toLocaleString('uz-UZ')}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3461FF', fontWeight: 700 }}>
                        <Coins size={16} />
                        {req.package_coins.toLocaleString()} coin
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: 700, color: 'white' }}>
                      {req.package_price.toLocaleString()} so'm
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {getStatusBadge(req.status)}
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            onClick={() => handleReject(req)}
                            disabled={processing === req.id}
                            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                          >
                            Rad etish
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={processing === req.id}
                            style={{ padding: '6px 12px', borderRadius: 8, background: '#10B981', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            {processing === req.id ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                            Tasdiqlash
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Bajarilgan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
