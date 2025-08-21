

interface Player {
  id: string;
  name: string;
}

interface Page {
  type: 'PROMPT' | 'DRAWING' | 'DESCRIBING';
  text?: string;
  dataUrl?: string;
  authorId: string;
}

interface Book {
  owner: Player;
  pages: Page[];
}

interface RevealPageProps {
  books: { [key: string]: Book };
  players: Player[];
  currentBookIndex: number;
  isHost: boolean;
  onNextBook: () => void;
}

const RevealPage: React.FC<RevealPageProps> = ({ books, players, currentBookIndex, isHost, onNextBook }) => {
  const getAuthorName = (authorId: string) => {
    const player = players.find(p => p.id === authorId);
    return player ? player.name : 'Unknown';
  };

  const bookIds = Object.keys(books);
  const currentBookId = bookIds[currentBookIndex];
  const currentBook = books[currentBookId];

  return (
    <div className="container mt-5">
      {currentBook && (
        <div className="card mb-3">
          <div className="card-header">
            <h3>{currentBook.owner.name}'s Book</h3>
          </div>
          <div className="card-body">
            {currentBook.pages.map((page, pageIndex) => (
              <div key={pageIndex} className="card mb-3">
                <div className="card-body">
                  {page.type === 'PROMPT' && (
                    <p className="card-text"><strong>Prompt:</strong> "{page.text}" (by {getAuthorName(page.authorId)})</p>
                  )}
                  {page.type === 'DRAWING' && (
                    <div>
                      <p className="card-text"><strong>Drawing:</strong> (by {getAuthorName(page.authorId)})</p>
                      <img src={page.dataUrl} alt="Drawing" className="img-fluid rounded" />
                    </div>
                  )}
                  {page.type === 'DESCRIBING' && (
                    <p className="card-text"><strong>Description:</strong> "{page.text}" (by {getAuthorName(page.authorId)})</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isHost && (
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={onNextBook} disabled={currentBookIndex >= bookIds.length - 1}>
            Next Book
          </button>
        </div>
      )}
    </div>
  );
};

export default RevealPage;
