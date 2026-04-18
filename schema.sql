DROP TABLE IF EXISTS UsersBooks;
DROP TABLE IF EXISTS Annotations;

CREATE TABLE UsersBooks (
  user_email TEXT NOT NULL,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  publisher TEXT,
  date TEXT,
  percent INTEGER,
  PRIMARY KEY (user_email, book_id)
);

CREATE TABLE Annotations (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  book_id TEXT NOT NULL,
  chapter TEXT,
  text TEXT,
  note TEXT,
  date TEXT
);
