import { FileText } from "lucide-react";

import ReactMarkdown from "react-markdown";

import { Link } from "react-router";

interface Props {
  id: string;
  judul: string; // Matches CatatanWithDetails.judul_catatan
  isi: string | null; // Matches CatatanWithDetails.isi_catatan
  createdAt: string;
}

const CatatanItem = ({ id, judul, isi, createdAt }: Props) => {
  return (
    <Link
      to={`/catatan/${id}`}
      className="block p-4 border rounded-lg hover:bg-base-200 transition"
    >
      <div className="flex items-start gap-3">
        <FileText className="w-5 h-5 text-primary mt-1" />
        <div>
          <h2 className="font-semibold text-lg">{judul}</h2>
          <div className="prose prose-sm max-w-none text-gray-600 overflow-hidden">
            <div className="line-clamp-3">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children} </span>,
                  strong: ({ children }) => <span>{children}</span>,
                  em: ({ children }) => <span>{children}</span>,
                  h1: ({ children }) => <span>{children} </span>,
                  h2: ({ children }) => <span>{children} </span>,
                  h3: ({ children }) => <span>{children} </span>,
                  h4: ({ children }) => <span>{children} </span>,
                  h5: ({ children }) => <span>{children} </span>,
                  h6: ({ children }) => <span>{children} </span>,
                  ul: ({ children }) => <span>{children}</span>,
                  ol: ({ children }) => <span>{children}</span>,
                  li: ({ children }) => <span>{children} </span>,
                  blockquote: ({ children }) => <span>{children}</span>,
                  code: ({ children }) => <span>{children}</span>,
                  pre: ({ children }) => <span>{children}</span>,
                }}
              >
                {isi ?? "_(Tidak ada isi)_"}
              </ReactMarkdown>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CatatanItem;
