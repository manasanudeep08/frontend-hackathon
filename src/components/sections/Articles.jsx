import React from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { articlesData, calculateReadingTime } from '../../data/articles.js';

/**
 * Articles / Blog Section
 * Displays verified technical writing or an honest "coming soon" state.
 * 
 * @param {{ onSelectArticle: (article: object) => void }} props
 */
export function Articles({ onSelectArticle }) {
  const hasArticles = Array.isArray(articlesData) && articlesData.length > 0;

  return (
    <section id="blog" className="section section-alt" aria-label="Technical Writing and Blog Articles">
      <div className="container">
        <SectionHeader
          eyebrow="Writing & Notes"
          title="Technical Writing & Articles"
          description="Engineering notes, architectural thinking, and project breakdowns from ongoing software development."
        />

        {/* 1. Empty State (When no verified articles are published yet) */}
        {!hasArticles ? (
          <div className="articles-empty-state" role="status">
            <div className="empty-state-icon-box" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="empty-state-content">
              <div className="empty-state-header">
                <h3 className="empty-state-title">Technical writing and articles are coming soon.</h3>
                <Badge variant="primary">Under Preparation</Badge>
              </div>
              <p className="empty-state-text">
                I am currently documenting engineering insights, software architecture patterns, and technical notes from my work across desktop companion applications, browser extensions, and automation pipelines. Once finalized and verified, articles will appear here.
              </p>
            </div>
          </div>
        ) : (
          /* 2. Published Articles Grid (Rendered when genuine articles are added) */
          <div className="articles-grid">
            {articlesData.map((article) => {
              const readingTime = calculateReadingTime(article.content) || article.readTime;

              return (
                <article key={article.id} className="article-card">
                  <div className="article-card-main">
                    {/* Metadata: Only display date when verified */}
                    <div className="article-meta">
                      {article.date && <span className="article-date">{article.date}</span>}
                      {article.date && readingTime && <span className="article-meta-divider">•</span>}
                      {readingTime && <span className="article-read-time">{readingTime}</span>}
                    </div>

                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>
                  </div>

                  <div className="article-footer">
                    <Badge variant="default">{article.category}</Badge>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectArticle(article)}
                      aria-haspopup="dialog"
                    >
                      <span>Read Article</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
