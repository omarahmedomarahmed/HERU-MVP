import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import {
  ArrowLeft, Trophy, Users, Eye, TrendingUp, BarChart3,
  MessageSquare, Monitor, Camera, ExternalLink, Calendar
} from 'lucide-react';

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString();
const fmtNum = (n) => (n || 0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

export default function TournamentReportPublic() {
  const { id } = useParams();

  const { data: tournament, isLoading: tLoading } = useQuery({
    queryKey: ['tournament-public', id],
    queryFn: () => apiCall(`/tournaments/${id}`),
    enabled: !!id,
  });

  const { data: reports = [], isLoading: rLoading } = useQuery({
    queryKey: ['tournament-report-public', id],
    queryFn: () => apiCall(`/tournament-reports?tournament_id=${id}&is_published=true`),
    enabled: !!id,
  });

  const report = reports[0];
  const isLoading = tLoading || rLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        <p>Tournament not found</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to={`/tournaments/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Tournament
          </Link>
          <div className="bg-[#1a1a2e] rounded-xl p-8 text-center border border-gray-800">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No published report for this tournament yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Viewers', value: fmtNum(report.total_viewers), icon: Eye, color: 'text-red-400' },
    { label: 'Peak Viewers', value: fmtNum(report.peak_viewers), icon: TrendingUp, color: 'text-red-400' },
    { label: 'Social Reach', value: fmtNum(report.social_reach), icon: Users, color: 'text-cyan-400' },
    { label: 'Discord Members', value: fmtNum(report.discord_members), icon: MessageSquare, color: 'text-red-400' },
    { label: 'HERU Signups', value: fmtNum(report.heru_signups), icon: Trophy, color: 'text-green-400' },
    { label: 'Stream Hours', value: report.stream_hours || 0, icon: Monitor, color: 'text-red-400' },
  ];

  const screenshots = report.kpi_screenshots || [];
  const socialPosts = report.social_posts || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={`/tournaments/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Tournament
        </Link>

        {/* Header */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-8 border border-gray-800 mb-6">
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
            <BarChart3 className="w-4 h-4" /> TOURNAMENT REPORT
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
            <span>{tournament.game}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fmtDate(tournament.schedule)}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tournament.teams?.length || 0} teams</span>
            <span>{fmtEGP(tournament.prizepool_total)} prize pool</span>
          </div>
        </div>

        {/* Summary */}
        {(report.summary || report.highlights) && (
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 mb-6">
            {report.summary && (
              <>
                <h2 className="font-semibold text-lg mb-2">Summary</h2>
                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{report.summary}</p>
              </>
            )}
            {report.highlights && (
              <>
                <h2 className="font-semibold text-lg mb-2">Highlights</h2>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.highlights}</p>
              </>
            )}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800 mb-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-red-400" /> KPI Screenshots
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {screenshots.map((ss, i) => (
                <div key={i} className="border border-gray-700 rounded-lg overflow-hidden">
                  {ss.url && <img src={ss.url} alt={ss.caption || ''} className="w-full h-48 object-cover" />}
                  <div className="p-3">
                    {ss.category && <span className="text-xs text-red-400 font-medium">{ss.category}</span>}
                    {ss.caption && <p className="text-sm text-gray-300 mt-1">{ss.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Posts */}
        {socialPosts.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-red-400" /> Social Media Coverage
            </h2>
            <div className="space-y-3">
              {socialPosts.map((post, i) => (
                <a key={i} href={post.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#0f0f1a] rounded-lg hover:bg-red-900/20 transition-colors">
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">{post.platform}</span>
                  <span className="text-gray-300 text-sm truncate flex-1">{post.url}</span>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
