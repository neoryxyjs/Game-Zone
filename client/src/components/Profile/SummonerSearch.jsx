import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';

const LOCAL_KEY = 'lol_summoner_search_history';

export default function SummonerSearch({ onSelect, showLinkButton = false }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar historial local
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    setSuggestions(history.filter(name => name.toLowerCase().includes(input.toLowerCase()) && input.length > 0));
  }, [input]);

  // Guardar en historial
  const saveToHistory = (name) => {
    let history = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    if (!history.includes(name)) {
      history = [name, ...history].slice(0, 10); // máx 10
      localStorage.setItem(LOCAL_KEY, JSON.stringify(history));
    }
  };

  // Buscar invocador
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
    setError('');
    setSearchResult(null);
    try {
      const res = await fetch(API_ENDPOINTS.RIOT.LOL(input));
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setSearchResult(data);
      saveToHistory(input);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar sugerencia
  const handleSuggestionClick = (name) => {
    setInput(name);
    setSuggestions([]);
  };

  // Enlazar invocador
  const handleLink = () => {
    if (onSelect && searchResult && searchResult.summoner) {
      onSelect(searchResult.summoner.name);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Buscar invocador de LoL"
          className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm w-full"
          autoComplete="off"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm">Buscar</button>
      </form>
      {suggestions.length > 0 && (
        <div className="bg-white border rounded shadow p-2 mb-2">
          <div className="text-xs text-gray-500 mb-1">Sugerencias recientes:</div>
          {suggestions.map(name => (
            <div key={name} className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded" onClick={() => handleSuggestionClick(name)}>{name}</div>
          ))}
        </div>
      )}
      {loading && <div className="text-blue-600 text-sm">Buscando...</div>}
      {error && <div className="text-red-500 text-sm">Error: {error}</div>}
      {searchResult && searchResult.summoner && (
        <div className="bg-gray-900 rounded-lg p-4 my-2 text-white shadow">
          <div className="flex items-center gap-4">
            <img src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/${searchResult.summoner.profileIconId}.png`} alt="icon" className="w-12 h-12 rounded-full border-2 border-blue-500" />
            <div>
              <div className="text-lg font-bold">{searchResult.summoner.name}</div>
              <div className="text-sm text-gray-300">Nivel: {searchResult.summoner.summonerLevel}</div>
              {searchResult.ranked && searchResult.ranked.length > 0 ? (
                <div className="mt-1">
                  <span className="font-semibold text-yellow-400">{searchResult.ranked[0].tier} {searchResult.ranked[0].rank}</span>
                  <span className="ml-2 text-gray-400">LP: {searchResult.ranked[0].leaguePoints}</span>
                  <span className="ml-2 text-green-400">Victorias: {searchResult.ranked[0].wins}</span>
                  <span className="ml-2 text-red-400">Derrotas: {searchResult.ranked[0].losses}</span>
                </div>
              ) : (
                <div className="mt-1 text-gray-400">Sin datos de ranked</div>
              )}
            </div>
          </div>
          {showLinkButton && (
            <button onClick={handleLink} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm w-full">Enlazar este invocador</button>
          )}
        </div>
      )}
    </div>
  );
} 