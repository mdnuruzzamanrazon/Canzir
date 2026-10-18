import React, { useState } from 'react';
import {
  MessageSquare,
  HelpCircle,
  Image,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Send,
  Eye,
  RefreshCw,
  Plus
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function ContentTab({
  reviews,
  questions,
  announcementText,
  setAnnouncementText,
  loading,
  onRefresh
}) {
  const [subTab, setSubTab] = useState('reviews'); // 'reviews' | 'questions' | 'banners'
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Q&A Answer Modal State
  const [answeringQuestion, setAnsweringQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');

  // Review status update
  const handleUpdateReviewStatus = async (id, status) => {
    setActionLoading(true);
    setFeedback('');
    try {
      await apiFetch(`/reviews/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setFeedback(`Review marked as ${status}`);
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Review delete
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setActionLoading(true);
    try {
      await apiFetch(`/reviews/admin/${id}`, { method: 'DELETE' });
      setFeedback('Review deleted');
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Q&A Answer submission
  const handleSaveAnswer = async (e) => {
    e.preventDefault();
    if (!answeringQuestion || !answerText.trim()) return;
    setActionLoading(true);
    try {
      await apiFetch(`/questions/admin/${answeringQuestion._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          answer: answerText.trim(),
          status: 'published'
        })
      });
      setFeedback('Answer saved and published to product page');
      setAnsweringQuestion(null);
      setAnswerText('');
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Q&A Delete
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    setActionLoading(true);
    try {
      await apiFetch(`/questions/admin/${id}`, { method: 'DELETE' });
      setFeedback('Question deleted');
      onRefresh();
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Announcement Banner
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({
          key: 'announcementBar',
          value: {
            enabled: true,
            textEn: announcementText,
            textBn: announcementText
          }
        })
      });
      setFeedback('Announcement bar updated across the storefront');
    } catch (err) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B4B]">
              Storefront Content &amp; Engagement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-stone-100 font-bold">
            Reviews, Inquiries &amp; Announcements
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Moderate verified buyer reviews, answer collector inquiries, and broadcast storefront announcements across Canzir.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
          title="Refresh Content"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : 'text-stone-400'}`} />
        </button>
      </div>

      {/* Subtab Navigation Pills - Full Width Responsive */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'reviews', label: 'Reviews Moderation', icon: MessageSquare, count: reviews.length },
          { id: 'questions', label: 'Customer Q&A', icon: HelpCircle, count: questions.filter(q => q.status === 'pending').length },
          { id: 'banners', label: 'Storefront Banners', icon: Image }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                subTab === tab.id
                  ? 'bg-[#C58B4B]/15 text-[#E6AF68] border border-[#C58B4B]/40 shadow-xs font-semibold'
                  : 'bg-[#181513] text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  tab.id === 'questions' && tab.count > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-stone-900 border border-stone-800 text-stone-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center justify-between animate-fadeIn shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-stone-400 hover:text-stone-200">&times;</button>
        </div>
      )}

      {/* SUBTAB 1: REVIEWS */}
      {subTab === 'reviews' && (
        <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-5 font-bold">Product</th>
                  <th className="py-3.5 px-5 font-bold">Customer</th>
                  <th className="py-3.5 px-5 font-bold">Rating &amp; Review</th>
                  <th className="py-3.5 px-5 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold">Submitted</th>
                  <th className="py-3.5 px-5 text-right font-bold">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-stone-500">
                      No customer reviews submitted yet.
                    </td>
                  </tr>
                ) : (
                  reviews.map(rev => (
                    <tr key={rev._id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-100 max-w-[160px] truncate">
                          {rev.product?.title || 'Artisan Lamp'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-200">{rev.userName}</div>
                        <div className="text-[10px] text-stone-500">{rev.userEmail || 'Verified Buyer'}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1 text-amber-400 mb-1">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-stone-300 line-clamp-2 text-xs">{rev.comment}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          rev.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : (rev.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')
                        }`}>
                          {rev.status || 'approved'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                        {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {rev.status !== 'approved' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateReviewStatus(rev._id, 'approved')}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-medium transition"
                            >
                              Approve
                            </button>
                          )}
                          {rev.status !== 'rejected' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateReviewStatus(rev._id, 'rejected')}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium transition"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            disabled={actionLoading}
                            onClick={() => handleDeleteReview(rev._id)}
                            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CUSTOMER Q&A */}
      {subTab === 'questions' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer Question</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Answer Status</th>
                  <th className="py-3 px-4">Answered By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-stone-500">
                      No customer questions submitted yet.
                    </td>
                  </tr>
                ) : (
                  questions.map(q => (
                    <tr key={q._id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-stone-200 max-w-[140px] truncate">
                        {q.product?.title || 'Artisan Fixture'}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-stone-100 font-medium">{q.question}</p>
                        {q.answer && (
                          <p className="text-stone-400 text-[11px] mt-1 pl-2 border-l border-[#C58B4B]/50 italic">
                            &ldquo;{q.answer}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-200">{q.customerName}</div>
                        <div className="text-[10px] text-stone-500">{q.customerPhone || q.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          q.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {q.status === 'published' ? 'Published' : 'Pending Answer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        {q.answeredBy || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setAnsweringQuestion(q);
                              setAnswerText(q.answer || '');
                            }}
                            className="px-2.5 py-1 rounded bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold text-[11px] transition"
                          >
                            {q.answer ? 'Edit Answer' : 'Answer'}
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: STOREFRONT BANNERS */}
      {subTab === 'banners' && (
        <div className="space-y-4">
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-serif text-stone-100 text-base font-semibold">Storefront Top Announcement Bar</h3>
              <p className="text-xs text-stone-500">
                Configure the dynamic luxury announcement bar that appears at the top of the consumer storefront.
              </p>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Announcement Message (English &amp; Bengali supported)
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. 🌿 Celebrating Handcrafted Elegance — Free Delivery Across Bangladesh on Orders Over ৳5,000"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 text-xs font-semibold transition"
                >
                  Save Storefront Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Q&A Answer Modal */}
      {answeringQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-lg text-stone-100 font-semibold">
                Answer Customer Question
              </h3>
              <button onClick={() => setAnsweringQuestion(null)} className="text-stone-400 hover:text-stone-200">✕</button>
            </div>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 text-xs space-y-1">
              <span className="text-stone-500 block text-[11px] font-semibold">Customer Question:</span>
              <p className="text-stone-200 font-medium">{answeringQuestion.question}</p>
              <span className="text-stone-500 text-[10px] block">
                Asked by {answeringQuestion.customerName} on {answeringQuestion.product?.title || 'Product'}
              </span>
            </div>

            <form onSubmit={handleSaveAnswer} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Your Official Concierge Answer</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Type an artisan and polite response to inform the customer and future visitors..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-[#C58B4B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAnsweringQuestion(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !answerText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#C58B4B] hover:bg-[#b0793c] text-stone-950 font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
