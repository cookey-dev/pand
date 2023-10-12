export class PandoraChecks {
    static Rest = {
        isGraphQL(r: PandoraRest): r is PandoraRest.GraphQL {
            const g = r as PandoraRest.GraphQL;
            return !!g.data;
        },
        isPlaylists(r: PandoraRest): r is PandoraRest.Playlists {
            const p = r as PandoraRest.Playlists;
            return p.view && p.view === 'PL';
        },
        isItems(r: PandoraRest): r is PandoraRest.Items {
            const i = r as PandoraRest.Items;
            const p = r as PandoraRest.Playlists;
            return i.items && !p.annotations;
        },
        isStations(r: PandoraRest): r is PandoraRest.Stations {
            const s = r as PandoraRest.Stations;
            return !!s.stations;
        },
        isInfo(r: PandoraRest): r is PandoraRest.Info {
            const i = r as PandoraRest.Info;
            return !!i.subscriber;
        },
        isSource(r: PandoraRest): r is PandoraRest.Source {
            const i = r as PandoraRest.Source;
            return !!i.item.audioUrl;
        },
        isPeek(r: PandoraRest): r is PandoraRest.Peek {
            const i = r as PandoraRest.Source;
            return this.isSource(i) && !i.source;
        },
        isSkip(r: PandoraRest): r is PandoraRest.Skip {
            return this.isPeek(r); // peek = source
        },
        isConcerts(r: PandoraRest): r is PandoraRest.Concerts {
            const c = r as PandoraRest.Concerts;
            return Array.isArray(c.artistEvents);
        },
        isProducts(r: PandoraRest): r is PandoraRest.Products {
            const p = r as PandoraRest.Products;
            return !!p.billingTerritory;
        },
        isSortedTypes(r: PandoraRest): r is PandoraRest.SortedTypes {
            const s = r as PandoraRest.SortedTypes;
            const p = r as PandoraRest.Playlists;
            return s.annotations && s.items && !p.view;
        },
        isVersion(r: PandoraRest): r is PandoraRest.Version {
            const v = r as PandoraRest.Version;
            return !isNaN(parseInt(v));
        }
    }
    static isPlaylist(i: Annotations.Playlist | Annotations.PlaylistCurator): i is Annotations.Playlist {
        const p = i as Annotations.Playlist;
        return p.type === 'PL';
    }
    static isArtist(i: Annotations.Album | Annotations.Artist | Annotations.Track): i is Annotations.Artist {
        const p = i as Annotations.Artist;
        return p.type === 'AR';
    }
    static isTrack(i: Annotations.Album | Annotations.Artist | Annotations.Track): i is Annotations.Track {
        const p = i as Annotations.Track;
        return p.type === 'TR';
    }
}
