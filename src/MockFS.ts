export interface FSFile{
    type: "file"
    name: string
    content: string
}

export interface FSDirectory{
    type: "directory"
    name: string
    children: Array<FSFile|FSDirectory>
}



export let FS: Array<FSDirectory> = [
    {name: "assets", children: [
        {type: "file", name: "test.flow", content: ""},
        {type: "file", name: "test2.flow", content: ""},
        {type: "file", name: "test3.flow", content: ""},
        {type: "directory", name: "test", children: [
            {type: "file", name: "test.flow", content: ""},
        ]
    }
    ], type: "directory"}, 
    {name: "scripts", children: [], type: "directory"}
]