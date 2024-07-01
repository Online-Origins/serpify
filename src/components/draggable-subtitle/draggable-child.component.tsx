import { Draggable, Droppable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";
import classNames from "classnames";

// Child element from draggable subtitle
export default function DraggableChild({
  title,
  index,
  handleTitleChange,
  setContentGeneratedOutlines,
  contentGeneratedOutlines,
  grantParentId,
  language,
  typeChange,
}: {
  title: any;
  index: any;
  handleTitleChange: any;
  setContentGeneratedOutlines: any;
  contentGeneratedOutlines: any;
  grantParentId: any;
  language: string;
  typeChange: any;
}) {
  return (
    <Draggable draggableId={title.id.toString()} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Subtitle
          draggable
            key={title.id}
            title={title}
            onChange={(value: string, id: number) =>
              handleTitleChange(id, value)
            }
            language={language}
            removeTitle={(e: number) =>
              setContentGeneratedOutlines(
                contentGeneratedOutlines.map((grandParent: any) => {
                  if (grandParent.id == grantParentId) {
                    const updatedSubtitles = grandParent.subtitles.filter(
                      (subtitle: any) => subtitle.id !== e
                    );
                    return { ...grandParent, subtitles: updatedSubtitles };
                  }
                  return grandParent;
                })
              )
            }
            typeChange={typeChange}
          />
        </div>
      )}
    </Draggable>
  );
}
