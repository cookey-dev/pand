declare namespace PandoraTypes {
    export type Uuid = string;
    export type NumericId = number;
    export type NumericIdString = string;
    export type FactoryId = string;
    export type UrlPath = string;
    export type Id = string;
    export type ItemType = 'PL' | 'TR' | 'AL' | 'AR' | 'LI' | 'SF' | 'CU' | 'AP' | 'ST';
    export namespace ItemType {
        export type Playlist = 'PL';
        export type PlaylistCurator = 'LI';
        export type Track = 'TR';
        export type Album = 'AL';
        export type Artist = 'AR';
        export type StationCurator = 'SF';
        export type Curator = 'CU';
        export type ArtistPlay = 'AP';
        export type Station = 'ST';
    }
    export type UnixTimestamp = number;
    export type UnixTimestampString = string;
    /**
     * ThorLayers is a goofy little string representation of a playlist cover image, details on parsing are contained with in the parseThor Api method.
     */
    export type ThorLayers = string;
    export type ParsedThorLayers = Array<string>;
    export type Seconds = number;
    /**
     * The only known value is "MOST_RECENT_MODIFIED". It is reccomended that clients handle sorting themselves.
     */
    export type SortOrder = string | 'MOST_RECENT_MODIFIED';
    /**
     * Known types are SharedListening, and StationThumbs
     * If the type is StationThumbs
     */
    export type LinkedType = 'StationThumbs' | 'SharedListening' | string;
    export namespace LinkedType {
        export type StationThumbs = 'StationThumbs';
        export function isThumbs(t: LinkedType): t is LinkedType.StationThumbs {
            return t === 'StationThumbs';
        }
        export type SharedListening = 'SharedListening';
        export function isShared(t: LinkedType): t is LinkedType.SharedListening {
            return t === 'SharedListening';
        }
    }
    /**
     * Twittet handle does not include the @-symbol
     */
    export type TwitterHandle = string;
    export type ArtUrlFragment = PandoraTypes.UrlPath;
    export type ArtUrl = string;
    export type HexColor = string;
    export type RecentlyPlayedTypename = 'ArtistPlay' | 'Album' | 'Playlist' | 'Station' | 'Deluxe' | string;
    export type StationSort = 'lastPlayedTime' | string;
    export type Pixels = number;
    export type StringDate = string;
    export type CountryCode = 'US' | string;
    export type ProductTier = 'PREMIUM_FAMILY_PLAN' | string;
    export type ProductType = 'PERSISTENT' | string;
    export type DiscountType = 'NONE' | string;
    export type DurationType = 'NONE' | string;
    export type CurrencyCode = 'USD' | string;
    export type PaymentProviderType = 'NONE' | string;
    export type PaymentProvider = 'NONE' | string;
    export type BooleanString = string;
    export type FamilyPlanType = 'CHILD' | 'ADULT' | string;
    export type BillingAccountName = 'X' | string;
    export type ItemLongType = RecentlyPlayedTypename;
    export type Repeat = 'REPEAT_NONE' | string;
    export type PlayerStyle = 'INTERACTIVE' | 'NON_INTERACTIVE' | string;
    export type Interaction = 'SKIP' | 'SEEK' | string;
    export type FloatString = string;
    export type AudioEncoding = 'aacplus' | string;
    export type XORKey = string;
    export type AudioUrl = string;
    export type Year = number;
    export type IntString = string;
    export type Gender = 'MALE' | 'FEMALE' | string;
    export type Milliseconds = number;
    export type Flag = 'onDemand' | 'highQualityStreamingAvailable' | 'adFreeSkip' | 'adFreeReplay' | 'seenWebPremiumWelcome' | string;
    export type Branding = 'PandoraPremium' | string;
    export type Url = string;
    export type AuthToken = string;
    export type Semver = string;
    export type Percentage = number;
    export type Explicit = 'NONE' | 'EXPLICIT' | 'CLEAN';
}

declare interface Auth {
    listenerId: PandoraTypes.NumericIdString;
    username: string;
    webname: string;
    explicitContentFilterEnabled: boolean;
    fullName: string;
    birthYear: PandoraTypes.Year;
    zipCode: PandoraTypes.IntString;
    gender: PandoraTypes.Gender;
    profilePrivate: boolean;
    emailOptOut: boolean;
    artistPromoEmailsEnabled: boolean;
    isNew: boolean;
    config: {
        branding: PandoraTypes.Branding;
        dailySkipLimit: number;
        stationSkipLimit: number;
        inactivityTimeout: PandoraTypes.Milliseconds;
        experiments: Array<unknown>;
        flags: Array<PandoraTypes.Flag>;
    }
    listenerToken: string;
    publicLid: string;
    highQualityStreamingEnabled: boolean;
    stationCount: number;
    placeholderProfileImageUrl: PandoraTypes.Url;
    autoplayEnabled: boolean;
    kruxToken: string;
    authToken: PandoraTypes.AuthToken;
    adkv: {
        [key: string]: string;
    }
    premiumAccessAdUrl: PandoraTypes.Url;
    premiumAccessNoAvailsAdUrl: PandoraTypes.Url;
    smartConversionAdUrl: PandoraTypes.Url;
    smartConversionDisabled: boolean;
    statiAdTargeting: string;
    webClientVersion: PandoraTypes.Semver;
    activeVxRewards: Array<unknown>;
}

declare namespace Annotations {
    export interface Playlist {
        scope: string;
        type: PandoraTypes.ItemType.Playlist;
        pandoraId: PandoraTypes.Id;
        version: number;
        name: string;
        description: string;
        timeCreated: PandoraTypes.UnixTimestamp;
        isPrivate: boolean;
        secret: boolean;
        linkedType: string | 'None';
        totalTracks: number;
        shareableUrlPath: PandoraTypes.UrlPath;
        thorLayers: PandoraTypes.ThorLayers;
        duration: PandoraTypes.Seconds;
        unlocked: boolean;
        timeLastUpdated: PandoraTypes.UnixTimestamp;
        viewerInfo: {
            editable: boolean;
        }
        autogenForListener: boolean;
        listenerIdInfo: {
            listenerId: PandoraTypes.NumericId;
            listenerPandoraId: PandoraTypes.Id;
            listenerIdToken: string;
        }
        /**
         * Usually only tracks
         */
        includedTrackTypes: Array<PandoraTypes.ItemType>;
        collectible: boolean;
        listenerId: PandoraTypes.NumericId;
        listenerPandoraId: PandoraTypes.Id;
        listenerIdToken: string;
    }
    export interface PlaylistCurator {
        pandoraId: PandoraTypes.Id;
        type: PandoraTypes.ItemType.PlaylistCurator;
        listenerId: PandoraTypes.NumericId;
        webname: string;
        fullname: string;
        displayname: string;
    }
    export interface Album {
        name: string;
        sortableName: string;
        releaseDate: PandoraTypes.StringDate;
        duration: PandoraTypes.Seconds;
        trackCount: number;
        isCompilation: boolean;
        icon: OtherPandoraInterfaces.Icon;
        rightsInfo: OtherPandoraInterfaces.Rights;
        tracks: Array<PandoraTypes.Id>;
        artistId: PandoraTypes.Id;
        artistName: string;
        explicitness: PandoraTypes.Explicit;
        shareableUrlPath: PandoraTypes.UrlPath;
        modificationTime: PandoraTypes.UnixTimestamp;
        slugPlusPandoraId: PandoraTypes.UrlPath;
        hasRadio: boolean;
        releaseType: PandoraTypes.ItemLongType;
        listenerReleaseType: PandoraTypes.ItemLongType;
        rawReleaseDate: PandoraTypes.StringDate;
        originalReleaseDate: PandoraTypes.StringDate;
        pandoraId: PandoraTypes.Id;
        type: PandoraTypes.ItemType.Album;
        scope: string;
        visible?: boolean;
    }
    export interface Artist {
        collaboration: boolean;
        primaryArtists: Array<unknown>;
        variousArtist: boolean;
        megastar: boolean;
        hasTakeoverModes: boolean;
        stationFactoryId?: PandoraTypes.FactoryId;
        name: string;
        sortableName: string;
        icon: OtherPandoraInterfaces.Icon;
        hasRadio: boolean;
        albumCount: number;
        trackCount: number;
        shareableUrlPath: PandoraTypes.UrlPath;
        slugPlusPandoraId: PandoraTypes.UrlPath;
        modificationTime: PandoraTypes.UnixTimestamp;
        pandoraId: PandoraTypes.Id;
        type: PandoraTypes.ItemType.Artist;
        scope: string;
        visible?: boolean;
        twitterHandle?: PandoraTypes.TwitterHandle
    }
    export interface Track {
        name: string;
        sortableName: string;
        duration: PandoraTypes.Seconds;
        durationMillis: PandoraTypes.Milliseconds;
        trackNumber: PandoraTypes.OneBasedIndex;
        icon: OtherPandoraInterfaces.Icon;
        rightsInfo: OtherPandoraInterfaces.Rights;
        albumId: PandoraTypes.Id;
        albumName: string;
        artistId: PandoraTypes.Id;
        artistName: string;
        explicitness: PandoraTypes.Explicit;
        shareableUrlPath: PandoraTypes.UrlPath;
        hasRadio: boolean;
        modificationTime: PandoraTypes.UnixTimestamp;
        slugPlusPandoraId: PandoraTypes.UrlPath;
        stationFactoryId: PandoraTypes.FactoryId;
        isrc: string;
        pandoraId: PandoraTypes.Id;
        type: PandoraTypes.ItemType.Track;
        scope: string;
        visible?: boolean;
        isrc?: string;
    }
}
declare type Annotations = Annotations.Album | Annotations.Artist | Annotations.Track | Annotations.Playlist;

declare namespace PandoraGraphQLEntities {
    export interface StationCurator {
        pandoraId: PandoraTypes.Id;
        curator: {
            pandoraId: PandoraTypes.Id;
            name: string;
            shareableUrlPath: PandoraTypes.UrlPath;
            artist: null;
        } | null;
    }
}
declare type PandoraGraphQLEntity = PandoraGraphQLEntities.StationCurator;

declare namespace PandoraSimpleItems {
    export interface Track {
        pandoraId: PandoraTypes.Id;
        pandoraType: PandoraTypes.ItemType.Track;
        albumPandoraId: PandoraTypes.Id;
        addedTime: PandoraTypes.UnixTimestamp;
        updatedTime: PandoraTypes.UnixTimestamp;
    }
    export interface Playlist {
        pandoraId: PandoraTypes.FactoryId;
        pandoraType: PandoraTypes.ItemType.Playlist;
        linkedType: PandoraTypes.LinkedType;
        linkedSourceId: string;
        addedTime: PandoraTypes.UnixTimestamp;
        updatedTime: PandoraTypes.UnixTimestamp;
        ownerId?: PandoraTypes.NumericId;
        ownerPandoraId?: PandoraTypes.Id;
    }
    export interface Album {
        pandoraId: PandoraTypes.Id;
        pandoraType: PandoraTypes.ItemType.Album;
        addedTime: PandoraTypes.UnixTimestamp;
        updatedTime: PandoraTypes.UnixTimestamp;
    }
}

declare type PandoraSimpleItem = PandoraSimpleItems.Album | PandoraSimpleItems.Playlist | PandoraSimpleItems.Track;

declare namespace OtherPandoraInterfaces {
    export interface Icon {
        artId: PandoraTypes.ArtUrlFragment;
        dominantColor: PandoraTypes.HexColor | null;
        artUrl: PandoraTypes.ArtUrl;
        _typename?: 'Art';
    }
    export interface Art {
        url: PandoraTypes.ArtUrl;
        size: PandoraTypes.Pixels;
    }
    export interface Rights {
        expirationTime: PandoraTypes.UnixTimestampString;
        hasInteractive: boolean;
        hasNonInteractive?: boolean;
        hasRadioRights: boolean;
        hasOffline: boolean;
        hasStatutory?: boolean;
        _typename?: 'Rights';
    }
    export interface Concert {
        id: string;
        date: PandoraTypes.StringDate;
        latitude: number;
        longitude: number;
        url: PandoraTypes.Url;
        ticketSource: PandoraTypes.TicketSource;
        onSaleDate: PandoraTypes.StringDate;
        venueName: string;
        city: string;
        /**
         * 2-letter state code, such as CA
         * Pandora is not available outside of the US
         */
        state: string;
        publishedDate: PandoraTypes.StringDate;
        isFeatured: boolean;
        artistUid: string;
        artistPandoraId: PandoraTypes.Id;
        otherArtistUids: Array<string>;
        otherArtistPandoraIds: Array<PandoraTypes.Id>;
    }
}

declare namespace PandoraComplexItems {
    export interface Playlist {
        name: string;
        pandoraId: PandoraTypes.FactoryId;
        pandoraType: PandoraTypes.ItemType.Playlist;
        addedTime: PandoraTypes.UnixTimestamp;
        updatedTime: PandoraTypes.UnixTimestamp;
    }
    export interface RecentlyPlayed {
        sourceEntity: {
            id: PandoraTypes.Id;
            type: PandoraTypes.ItemType;
            name?: string;
            isCollected?: boolean;
            shareableUrlPath?: PandoraTypes.UrlPath;
            artist?: {
                id: PandoraTypes.Id;
                name: string;
                shareableUrlPath: PandoraTypes.UrlPath;
                icon?: OtherPandoraInterfaces.Icon;
                _typename: string;
            }
            icon?: OtherPandoraInterfaces.Icon;
            rightsInfo?: OtherPandoraInterfaces.Rights;
            totalTracks?: number;
            isEditable?: boolean;
            hasVoiceTrack?: boolean;
            listenerIdInfo?: {
                id: PandoraTypes.Id;
                displayName: string;
                isMe: boolean;
                _typename: 'Profile';
            }
            _typename: PandoraTypes.RecentlyPlayedTypename;
        }
        _typename: 'RecentlyPlayedSource';
    }
    export interface Station {
        stationId: PandoraTypes.NumericIdString;
        stationFactoryPandoraId: PandoraTypes.FactoryId;
        pandoraId: PandoraTypes.Id;
        name: string;
        art: Array<OtherPandoraInterfaces.Art>;
        dateCreated: PandoraTypes.StringDate;
        lastPlayed: PandoraTypes.StringDate;
        totalPlayTime: PandoraTypes.Seconds;
        isNew: boolean;
        allowDelete: boolean;
        allowRename: boolean;
        allowEditDescription: boolean;
        allowAddSeed: boolean;
        isShared: boolean;
        isOnDemandEditorialStation: boolean;
        isAdvertiserStation: boolean;
        canShuffleStation: boolean;
        canAutoShare: boolean;
        advertisingKey: string;
        isArtistMessagesEnabmled: boolean;
        isThumbprint: boolean;
        isShuffle: boolean;
        genre: Array<unknown>;
        genreSponsorship: string;
        initialSeed: {
            musicId: string;
            pandoraId: PandoraTypes.Id;
        }
        adkv: {
            artist: string;
            genre: string;
            clean: string;
            gcat: string;
        }
        creatorWebname: string;
        artId: PandoraTypes.ArtUrlFragment;
        dominantColor: PandoraTypes.HexColor;
        listenerId: PandoraTypes.ListenerId;
        deleted: boolean;
        stationType: PandoraTypes.StationType;
        timeAdded: PandorabooleantringDate;
        lastUpdated: PandoraTypes.StringDate;
        hasTakeoverModes: boolean;
        hasCuratedModes: boolean;
        stationNameWithTwitterHandle?: string;
    }
}

declare namespace PandoraRest {
    export interface Playlists {
        view: PandoraTypes.ItemType.Playlist;
        listenerId: PandoraTypes.NumericId;
        listenerPandoraId: PandoraTypes.Id;
        totalCount: number;
        offset: number;
        limit: number;
        annotations: {
            [key: PandoraTypes.FactoryId]: Annotations.Playlist | Annotations.PlaylistCurator;
        }
        sortOrder: PandoraTypes.SortOrder;
        version: number;
        items: Array<PandoraComplexItems.Playlist>;
    }
    export interface Items {
        listenerId: PandoraTypes.NumericId;
        limit: number;
        version: number;
        items: Array<PandoraSimpleItem>;
    }
    export interface Stations {
        totalStations: number;
        sortedBy: PandoraTypes.StationSort;
        index: number;
        stations: Array<PandoraComplexItems.Station>;
    }
    export interface Info {
        subscriber: boolean;
        giftee: boolean;
        inPaymentBackedTrial: boolean;
        activeProduct: {
            billingTerritory: PandoraTypes.CountryCode;
            productTier: PandoraTypes.ProductTier;
            productType: PandoraTypes.ProductType;
            discountType: PandoraTypes.DiscountType;
            durationType: PandoraTypes.DurationType;
            durationTime: number;
            price: number;
            acceptedCurrency: PandoraTypes.CurrencyCode;
            paymentProviderType: PandoraTypes.PaymentProviderType;
            paymentProvider: PandoraTypes.PaymentProvider;
            displayablePaymentProvider: string;
            productDetails: {
                ipg: PandoraTypes.BooleanString;
                familyPlanType?: PandoraTypes.FamilyPlanType;
                productDescription: string;
            }
        }
        pendingProducts: string;
        autoRenew: boolean;
        paymentProviderType: PandoraTypes.PaymentProviderType;
        paymentProvider: PandoraTypes.PaymentProvider;
        displayablePaymentProvider: string;
        ipgEligible: boolean;
        billingAccountName: PandoraTypes.BillingAccountName;
    }
    export interface OgSource {
        type: PandoraTypes.ItemLongType;
        pandoraId: PandoraTypes.Id;
        repeat: PandoraTypes.Repeat;
        shuffle: boolean;
        currentIndex: number;
        sourceName: string;
        artistName: string;
        mode?: {
            modeId: PandoraTypes.Id;
            modeName: string;
        }
    }
    export interface Source {
        item: {
            index: number;
            type: PandoraTypes.ItemLongType;
            pandoraId: PandoraTypes.Id;
            sourceId: PandoraTypes.Id;
            itemId: PandoraTypes.Id;
            audioUrl: PandoraTypes.AudioUrl;
            key?: PandoraTypes.XORKey;
            encoding: PandoraTypes.AudioEncoding;
            filegain: PandoraTypes.FloatString;
            artId: PandoraTypes.ArtUrlFragment;
            interactions: Array<PandoraTypes.Interaction>;
            playerStyle: PandoraTypes.PlayerStyle;
            songName: string;
            albumName: string;
            artistName: string;
            duration: PandoraTypes.Seconds;
            trackToken: string;
            currentProgress: number;
            artUrl: PandoraTypes.ArtUrl;
        }
        annotations: {
            [key: PandoraTypes.Id]: Annotations.Album | Annotations.Artist | Annotations.Track;
        }
        source: OgSource;
    }
    export interface Peek extends Omit<Source, 'source'> {}
    export interface Skip extends Peek {} // same response as peek
    export interface Concerts {
        artistEvents: Array<OtherPandoraInterfaces.Concert>
    }
    export interface Products {
        listenerId: PandoraTypes.NumericId;
        billingTerritory: PandoraTypes.CountryCode;
        productGroups: Array<unknown>;
    }
    export interface SortedTypes {
        listenerId: PandoraTypes.NumericId;
        listenerPandoraId: PandoraTypes.Id;
        totalCount: number;
        offset: number;
        limit: number;
        annotations: {
            [key: PandoraTypes.Id]: Annotations.Album | Annotations.Playlist | Annotations.Artist | Annotations.Track;
        }
        sortOrder: PandoraTypes.SortOrder;
        version: number;
        items: Array<PandoraSimpleItem>;
    }
    export interface Annotate {
        [key: PandoraTyped.Id]: Annotations.Album | Annotations.Artist | Annotations.Album;
    }
    export type Version = PandoraTypes.IntString;
    export interface GraphQL {
        data: {
            entities?: Array<PandoraGraphQLEntity>;
            recentlyPlayedSources?: {
                items: Array<PandoraComplexItems.RecentlyPlayed>;
                /**
                 * Should bear some resemblence to the sent OperationName
                 */
                _typename: string;
            }
        }
    }
}
declare type PandoraRest = PandoraRest.Playlists 
                         | PandoraRest.Items 
                         | PandoraRest.GraphQL 
                         | PandoraRest.Stations 
                         | PandoraRest.Info 
                         | PandoraRest.Source 
                         | PandoraRest.Peek 
                         | PandoraRest.Skip
                         | PandoraRest.Concerts
                         | PandoraRest.Products
                         | PandoraRest.Version;

// End of Pandora API responses

declare namespace Parsed {
    /**
     * Key: size
     * Value: url
     */
    export type Art = Map<string, string>;
}
