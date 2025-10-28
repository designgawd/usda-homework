export interface Title {
    number: number;
    name: string;
    latest_amended_on: string;
    latest_issue_date: string;
    up_to_date_as_of: string;
    reserved: boolean;
    processing_in_progress?: boolean;
}

export interface Meta {
    date: string;
    import_in_progress: boolean;
}

export interface TitlesResponse {
    titles: Title[];
    meta: Meta;
}