import { parseMarkup } from '../../shared/markup';

type Props = {
    text: string;
    strongClassName?: string;
    accentClassName?: string;
};

// Renders **strong** / ==accent== content markup as styled spans (text nodes only, no HTML)
export function RichText({ text, strongClassName, accentClassName }: Props) {
    return (
        <>
            {parseMarkup(text).map((s, i) =>
                s.mark ? (
                    <span key={i} className={s.mark === 'strong' ? strongClassName : accentClassName}>
                        {s.text}
                    </span>
                ) : (
                    s.text
                ),
            )}
        </>
    );
}
