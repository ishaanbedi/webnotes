import PlateEditor from "@/components/plate-editor";
import SharedPlate from "@/components/shared-plate";
import { getXataClient } from "@/lib/xata"

async function getServerSideProps(webnoteID: string) {
    const xata = getXataClient();
    try {
        const record = await xata.db.webnotes2.read(`rec_${webnoteID}`);
        if (record === null) {
            return {
                found: false,
            };
        } else {
            try {

                const json = JSON.parse(record.note!);
                const note = json.note;
                return {
                    found: true,
                    props: {
                        json: note,
                    },
                };
            }
            catch (error) {
                return {
                    found: false,
                };
            }
        }
    } catch (error) {
        return { props: { error } };
    }

}

export default async function SharedDynamic(
    { params }: { params: { webnoteID: string } }
) {
    const getRecord = await getServerSideProps(params.webnoteID);
    if (!getRecord.found) {
        return <div>Not found</div>;
    }
    try {
        return (
            <div>
                <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                    <div className="rounded-lg border bg-background shadow">
                        <SharedPlate note={getRecord.props!.json} />
                    </div>
                </section>
            </div>
        )
    } catch (error) {
        return <div>Error fetching: {JSON.stringify(error)}</div>
    }
}
