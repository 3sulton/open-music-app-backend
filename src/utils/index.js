/* eslint-disable camelcase */

const mapDBToSongModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBToPlaylistModel = ({ id, name, owner }) => ({
  id,
  name,
  username: owner,
});

module.exports = { mapDBToSongModel, mapDBToPlaylistModel };
