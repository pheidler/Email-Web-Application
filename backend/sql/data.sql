
-- Populate Your Tables Here --
INSERT INTO users(email, passwordHash, mailboxes, profilePicture, name, showAvatar) VALUES ('anna@books.com', '$2b$10$Y00XOZD/f5gBSpDusPUgU.G1ohpR3oQbbBHK4KzX7dU219Pv/lzze', '{ Inbox, Trash, Sent }', 'https://res.cloudinary.com/rrees/image/upload/v1606098596/fim0bxki72rhoxvkvyhb.jpg', 'Pete Heidler', true);

INSERT INTO mail(mailbox, email, mail, starred, unread) VALUES ('Inbox', 'anna@books.com', '{"to":{"name":"Shandra Rheam","email":"srheam0@myspace.com"},"from":{"name":"CSE183 Student","email":"cse183student@ucsc.edu"},"received":"2020-11-17T23:17:19Z","sent":"2020-11-14T17:09:17Z","content":"Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.\n\nQuisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.","subject":"Sent sent sent"}', false, true);
