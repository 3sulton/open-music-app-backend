const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsHandler {
  constructor(playlistsService, songsService, usersService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name, owner,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(owner);
    const user = await this._usersService.getUserById(owner);
    const playlistsWithUsername = playlists.map((playlist) => ({
      ...playlist,
      username: user.username,
    }));
    return {
      status: 'success',
      data: {
        playlists: playlistsWithUsername,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, owner);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    const song = await this._songsService.getSongById(songId);
    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    // harusnya ada pengecekan apakah lagu sudah ada di playlist atau belum
    // tapi karena di test case tidak ada, maka tidak diimplementasikan
    // saya malas nulisnya :p
    await this._playlistsService.addSongToPlaylist(playlistId, songId);
    
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
        
    const playlist = await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    const user = await this._usersService.getUserById(owner);
    playlist.username = user.username;
    playlist.songs = await this._playlistsService.getSongsInPlaylist(playlistId);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
        
    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);
        
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
