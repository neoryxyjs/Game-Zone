import React from 'react';

const GAME_STYLES = {
  'League of Legends': {
    banner: 'bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-900',
    border: 'border-blue-500',
    glow: 'shadow-[0_0_16px_4px_rgba(59,130,246,0.5)]',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    rankIcon: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/ui/ranked-emblem/Gold.png',
  },
  'Valorant': {
    banner: 'bg-gradient-to-r from-gray-900 via-red-700 to-pink-900',
    border: 'border-red-500',
    glow: 'shadow-[0_0_16px_4px_rgba(239,68,68,0.5)]',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    rankIcon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-8a57b3546b43/24/smallicon.png',
  },
  'default': {
    banner: 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900',
    border: 'border-gray-400',
    glow: 'shadow',
    badgeBg: 'bg-gray-600',
    badgeText: 'text-white',
    rankIcon: '',
  }
};

export default function GamerProfileHeader({ user }) {
  const style = GAME_STYLES[user?.game] || GAME_STYLES['default'];

  return (
    <div className={`w-full rounded-2xl ${style.banner} p-6 sm:p-8 flex flex-col items-center relative overflow-hidden`}>
      {/* Avatar */}
      <div className={`relative mb-3 sm:mb-4`}>
        <img
          src={user.avatar}
          alt={user.username}
          className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${style.border} ${style.glow} bg-gray-900 object-cover`}
        />
        {style.rankIcon && (
          <img
            src={style.rankIcon}
            alt="Rank"
            className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full border-2 border-gray-800"
          />
        )}
      </div>
      {/* Nombre y badge */}
      <div className="flex flex-col items-center">
        <span className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          {user.username}
        </span>
        <span className={`mt-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${style.badgeBg} ${style.badgeText} shadow`}>{user.game}</span>
      </div>
    </div>
  );
} 