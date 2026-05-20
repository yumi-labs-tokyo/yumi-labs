import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
} from 'docx';

function noBorder() {
  const s = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return { top: s, bottom: s, left: s, right: s, insideH: s, insideV: s };
}

export async function onRequestPost(context) {
  let minutes;
  try {
    minutes = await context.request.json();
  } catch {
    return Response.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 });
  }

  const { meta, summary, agendas, actionItems } = minutes;
  const children = [];

  // タイトル
  children.push(
    new Paragraph({
      text: meta.title || '議事録',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  // 会議情報テーブル
  const metaRows = [
    ['日時', `${meta.date}　${meta.startTime}〜${meta.endTime}`],
    ...(meta.location ? [['場所', meta.location]] : []),
    ...(meta.participants?.length > 0 ? [['参加者', meta.participants.join('、')]] : []),
  ];

  children.push(
    new Table({
      borders: noBorder(),
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                borders: noBorder(),
                width: { size: 15, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
              }),
              new TableCell({
                borders: noBorder(),
                width: { size: 85, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })],
              }),
            ],
          })
      ),
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // 要約
  if (summary) {
    children.push(new Paragraph({ text: '要約', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
    children.push(new Paragraph({ children: [new TextRun({ text: summary, size: 20 })], spacing: { after: 300 } }));
  }

  // アジェンダ
  for (let i = 0; i < (agendas || []).length; i++) {
    const agenda = agendas[i];
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${String(i + 1).padStart(2, '0')}　`, color: 'AAAAAA', size: 24 }),
          new TextRun({ text: agenda.title, bold: true, size: 24 }),
          new TextRun({ text: agenda.timeRange ? `　${agenda.timeRange}` : '', color: '888888', size: 18 }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );

    for (const item of (agenda.items || [])) {
      const badge = item.type === 'decision' ? '【決定】' : item.type === 'action' ? '【宿題】' : '';
      children.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `${item.timestamp}　`, color: '888888', size: 18, font: 'Courier New' }),
            new TextRun({ text: `${item.speaker}　`, bold: true, size: 20 }),
            ...(badge ? [new TextRun({ text: badge, color: badge === '【決定】' ? '8B2C1F' : 'A17A3E', size: 18 })] : []),
            new TextRun({ text: item.content, size: 20 }),
          ],
        })
      );
    }
  }

  // アクションアイテム
  if (actionItems?.length > 0) {
    children.push(
      new Paragraph({ text: 'アクションアイテム', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } })
    );
    for (const a of actionItems) {
      children.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: '□　', size: 20 }),
            new TextRun({ text: `${a.assignee}　`, bold: true, size: 20 }),
            new TextRun({ text: a.task, size: 20 }),
            new TextRun({ text: `　（期日: ${a.dueDate}）`, color: '888888', size: 18 }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: '游明朝', size: 20 } },
      },
    },
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const arrayBuffer = await blob.arrayBuffer();
  const filename = encodeURIComponent(`議事録_${meta.title || 'untitled'}_${meta.date}.docx`);

  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
