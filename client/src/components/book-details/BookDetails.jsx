import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as bookService from '../../services/bookService';
import * as commentService from '../../services/commentService';
import styles from './BookDetails.module.css';
import AuthContext from "../../contexts/AuthContext";
import Path from "../../paths";
import { pathToUrl } from "../../utils/pathUtils";
import ConfirmationModal from "../confirmation-modal/ConfirmationModal";
import useForm from "../../hooks/UseForm";

export default function BookDetails() {
    const navigate = useNavigate();
    const [book, setBook] = useState({});
    const [comments, setComments] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { bookId } = useParams();

    const { username, userId } = useContext(AuthContext);

    useEffect(() => {
        bookService.getOne(bookId)
            .then(setBook);

        commentService.getAll(bookId)
            .then(setComments);
    }, [bookId]);

    const addCommentHandler = async (formValues) => {
        const newComment = await commentService.create(
            bookId,
            formValues.comment
        );

        newComment.owner = { username };

        setComments(prevComments => [...prevComments, newComment]);
        formValues.comment = '';
    }

    const { formValues, changeHandler, onSubmit } = useForm(addCommentHandler, {
        comment: '',
    })

    const onDeleteButtonClickHandler = async () => {
        await bookService.remove(bookId);

        navigate(Path.BooksList)
    }

    return (
        <div className="container">
            <div className="row">
                <img src={book.imageUrl} alt="" />
                <div className="col-md-6 book-details">
                    <h2>{book.title}</h2>
                    <p>Genre: {book.genre}</p>
                    <p>Rate: {book.rating}</p>
                    <h4>About the book:</h4>
                    <p>{book.summary}</p>
                    {userId === book._ownerId && (
                        <h4>Your opinion:</h4>
                    )}
                    {userId !== book._ownerId && (
                        <h4>{book.createdBy}'s opinion:</h4>
                    )}
                    <p>{book.opinion}</p>

                    {userId === book._ownerId && (
                        <div className="buttons">
                            <Link to={pathToUrl(Path.BookEdit, { bookId })} className="button">Edit</Link>
                            <button className="button" onClick={() => setShowConfirmation(true)}>Delete</button>

                            {showConfirmation && (
                                <ConfirmationModal onConfirm={onDeleteButtonClickHandler} onHide={() => setShowConfirmation(false)} title={book.title} />
                            )}

                        </div>
                    )}
                </div>

                <div className={styles.commentForm}>
                    <h1>Comments</h1>
                    <div className={styles.allComments}>
                        {comments.map(({ _id, text, owner: { username } }) => (
                            <li key={_id} className="comment">
                                <p>{username}: {text}</p>
                            </li>
                        ))}
                    </div>

                    {comments.length === 0 && (
                        <h3>There are no comments for this book.</h3>
                    )}

                    <h1>Leave a Reply</h1>

                    <form className={styles.create} onSubmit={onSubmit}>
                        <input
                            type="text"
                            id="comment"
                            name="comment"
                            value={formValues.comment}
                            onChange={changeHandler}
                        />
                        <button className="btn btn-primary mt-2" type="submit">Add comment</button>
                    </form>
                </div>
            </div>
        </div>
    );
}