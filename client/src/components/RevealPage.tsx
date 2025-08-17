

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
  players: Player[]; // To map authorId to author name
}

const RevealPage: React.FC<RevealPageProps> = ({ books, players }) => {
  const getAuthorName = (authorId: string) => {
    const player = players.find(p => p.id === authorId);
    return player ? player.name : 'Unknown';
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Game Over! The Reveals:</h2>
      <div className="accordion" id="revealAccordion">
        {Object.values(books).map((book, bookIndex) => (
          <div className="accordion-item" key={book.owner.id}>
            <h2 className="accordion-header" id={`heading${bookIndex}`}>
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${bookIndex}`} aria-expanded="true" aria-controls={`collapse${bookIndex}`}>
                Book by {book.owner.name}
              </button>
            </h2>
            <div id={`collapse${bookIndex}`} className="accordion-collapse collapse show" aria-labelledby={`heading${bookIndex}`} data-bs-parent="#revealAccordion">
              <div className="accordion-body">
                {book.pages.map((page, pageIndex) => (
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevealPage;
