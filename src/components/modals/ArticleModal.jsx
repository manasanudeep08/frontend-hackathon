import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Badge } from '../common/Badge.jsx';
import { calculateReadingTime } from '../../data/articles.js';

/**
 * In-Page Article Deep Dive Reader Modal
 * Accessible modal for reading technical essays, case studies, and documentation.
 * 
 * @param {{
 *   article: object | null,
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
export function ArticleModal({ article, isOpen, onClose }) {
  if (!article) return null;

  const readingTime = calculateReadingTime(article.content) || article.readTime;
  const metaParts = [];
  if (article.date) metaParts.push(article.date);
  if (readingTime) metaParts.push(readingTime);
  if (article.category) metaParts.push(article.category);
  const subtitle = metaParts.join(' • ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={article.title}
      subtitle={subtitle}
      footer={
        <div className="article-modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close Article
          </button>
        </div>
      }
    >
      <article className="article-reader-container">
        {article.subtitle && (
          <p className="article-lead-subtitle">{article.subtitle}</p>
        )}

        <div className="article-prose-body">
          {Array.isArray(article.content) && article.content.map((block, index) => {
            if (block.type === 'paragraph') {
              return (
                <p key={index} className="article-paragraph">
                  {block.text}
                </p>
              );
            }

            if (block.type === 'heading') {
              return (
                <h3 key={index} className="article-section-heading">
                  {block.text}
                </h3>
              );
            }

            if (block.type === 'subheading') {
              return (
                <h4 key={index} className="article-sub-heading">
                  {block.text}
                </h4>
              );
            }

            if (block.type === 'code') {
              return (
                <div key={index} className="article-code-container">
                  {block.language && (
                    <div className="code-block-header">
                      <span className="code-block-lang">{block.language}</span>
                    </div>
                  )}
                  <pre className="code-block-pre" tabIndex="0">
                    <code>{block.code}</code>
                  </pre>
                </div>
              );
            }

            if (block.type === 'list') {
              return (
                <div key={index} className="article-points-card">
                  {block.title && <h4 className="points-card-title">{block.title}</h4>}
                  <ul className="points-card-list">
                    {Array.isArray(block.items) && block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            }

            return null;
          })}
        </div>

        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <footer className="article-tags-footer">
            <span className="article-tags-label">Topics:</span>
            <div className="article-tags-list">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </footer>
        )}
      </article>
    </Modal>
  );
}
