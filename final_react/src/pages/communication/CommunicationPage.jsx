import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  getNoticeList,
  getImportantNotices,
  getNoticeDetail,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../../api/noticeApi';
import './communicationPage.css';

const CommunicationPage = () => {
  const { accessToken, userId, roles } = useSelector((state) => state.auth);
  const isLoggedIn = !!accessToken;
  const isAdmin = Array.isArray(roles) && roles.includes('ADMIN');

  const [importantList, setImportantList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [detailNotice, setDetailNotice] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImportant, setFormImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadList = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const [impRes, listRes] = await Promise.all([
        getImportantNotices(),
        getNoticeList(p),
      ]);
      setImportantList(Array.isArray(impRes) ? impRes : []);
      setNoticeList(listRes.content ?? []);
      setTotalPages(listRes.totalPages ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList(page);
  }, [page, loadList]);

  const handleRowClick = async (id) => {
    try {
      const data = await getNoticeDetail(id);
      setDetailNotice(data);
      setShowDetail(true);
    } catch (e) {
      console.error(e);
    }
  };

  const closeDetail = () => {
    if (detailNotice) {
      const updateViewCount = (list) =>
        list.map((n) =>
          n.notificationId === detailNotice.notificationId
            ? { ...n, viewCount: detailNotice.viewCount }
            : n
        );
      setNoticeList((prev) => updateViewCount(prev));
      setImportantList((prev) => updateViewCount(prev));
    }
    setShowDetail(false);
  };

  const openCreate = () => {
    setEditingNotice(null);
    setFormTitle('');
    setFormContent('');
    setFormImportant(false);
    setShowForm(true);
  };

  const openEdit = (notice) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormImportant(notice.important);
    closeDetail();
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('공지를 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(id);
      setShowDetail(false);
      loadList(page);
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.notificationId, {
          title: formTitle,
          content: formContent,
          important: formImportant,
        });
      } else {
        await createNotice({ title: formTitle, content: formContent, important: formImportant });
      }
      setShowForm(false);
      loadList(page);
    } catch {
      alert('저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 10);
  };

  const canEdit = () => isAdmin;

  return (
    <div className="notice-layout">
      <div className="notice-header">
        <h2 className="notice-title">공지사항</h2>
        {isAdmin && (
          <button className="notice-write-btn" onClick={openCreate}>
            + 공지 등록
          </button>
        )}
      </div>

      {importantList.length > 0 && (
        <div className="notice-important-section">
          <div className="notice-section-label">주요 공지</div>
          <table className="notice-table">
            <tbody>
              {importantList.map((n) => (
                <tr
                  key={n.notificationId}
                  className="notice-row notice-row--important"
                  onClick={() => handleRowClick(n.notificationId)}
                >
                  <td className="notice-td-badge">
                    <span className="notice-badge">중요</span>
                  </td>
                  <td className="notice-td-title">{n.title}</td>
                  <td className="notice-td-writer">{n.writer}</td>
                  <td className="notice-td-views">{n.viewCount}</td>
                  <td className="notice-td-date">{formatDate(n.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="notice-list-section">
        <table className="notice-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>번호</th>
              <th>제목</th>
              <th style={{ width: '100px' }}>작성자</th>
              <th style={{ width: '80px' }}>조회수</th>
              <th style={{ width: '110px' }}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  불러오는 중...
                </td>
              </tr>
            ) : noticeList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              noticeList.map((n, idx) => (
                <tr
                  key={n.notificationId}
                  className="notice-row"
                  onClick={() => handleRowClick(n.notificationId)}
                >
                  <td className="notice-td-num">{page * 10 + idx + 1}</td>
                  <td className="notice-td-title">
                    <div className="notice-td-title-inner">
                      {n.important && <span className="notice-badge">중요</span>}
                      {n.title}
                    </div>
                  </td>
                  <td className="notice-td-writer">{n.writer}</td>
                  <td className="notice-td-views">{n.viewCount}</td>
                  <td className="notice-td-date">{formatDate(n.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="notice-pagination">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              이전
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
              다음
            </button>
          </div>
        )}
      </div>

      {showDetail && detailNotice && (
        <div className="notice-modal-overlay" onClick={closeDetail}>
          <div className="notice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notice-modal-header">
              <div className="notice-modal-title-area">
                {detailNotice.important && <span className="notice-badge">중요</span>}
                <h3 className="notice-modal-title">{detailNotice.title}</h3>
              </div>
              <button className="notice-modal-close" onClick={closeDetail}>
                ✕
              </button>
            </div>
            <div className="notice-modal-meta">
              <span>작성자: {detailNotice.writer}</span>
              <span>조회수: {detailNotice.viewCount}</span>
              <span>{formatDate(detailNotice.createdAt)}</span>
            </div>
            <div className="notice-modal-content">{detailNotice.content}</div>
            {canEdit() && (
              <div className="notice-modal-footer">
                <button className="notice-edit-btn" onClick={() => openEdit(detailNotice)}>
                  수정
                </button>
                <button
                  className="notice-delete-btn"
                  onClick={() => handleDelete(detailNotice.notificationId)}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="notice-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="notice-modal notice-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notice-modal-header">
              <h3 className="notice-modal-title">
                {editingNotice ? '공지 수정' : '공지 등록'}
              </h3>
              <button className="notice-modal-close" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <div className="notice-form-body">
              <div className="notice-form-row">
                <label>제목</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  maxLength={100}
                />
              </div>
              <div className="notice-form-row">
                <label>내용</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={8}
                />
              </div>
              <div className="notice-form-row notice-form-row--check">
                <label>
                  <input
                    type="checkbox"
                    checked={formImportant}
                    onChange={(e) => setFormImportant(e.target.checked)}
                  />
                  주요 공지로 설정
                </label>
              </div>
            </div>
            <div className="notice-modal-footer notice-form-footer">
              <button className="notice-cancel-btn" onClick={() => setShowForm(false)}>
                취소
              </button>
              <button
                className="notice-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationPage;
