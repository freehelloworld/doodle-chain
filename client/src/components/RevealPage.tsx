

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
    <div>
      <h2>Game Over! The Reveals:</h2>
      {Object.values(books).map((book) => (
        <div key={book.owner.id} style={{ border: '2px solid #333', margin: '20px 0', padding: '15px', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
          <h3>Book by {book.owner.name}</h3>
          {book.pages.map((page, index) => (
            <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px dashed #999', backgroundColor: '#fff' }}>
              {page.type === 'PROMPT' && (
                <p><strong>Prompt:</strong> "{page.text}" (by {getAuthorName(page.authorId)})</p>
              )}
              {page.type === 'DRAWING' && (
                <div>
                  <p><strong>Drawing:</strong> (by {getAuthorName(page.authorId)})</p>
                  <img src={page.dataUrl} alt="Drawing" style={{ maxWidth: '100%', border: '1px solid #eee' }} />
                </div>
              )}
              {page.type === 'DESCRIBING' && (
                <p><strong>Description:</strong> "{page.text}" (by {getAuthorName(page.authorId)})</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RevealPage;
