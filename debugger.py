#!/usr/bin/env python

import os
from empress._plot import combined_plot
import qiime2 as q2
import pandas as pd
from q2_types.tree import NewickFormat
from skbio import OrdinationResults
from emperor import Emperor


def main():
    # read the data
    tree = q2.Artifact.load('./docs/moving-pictures/rooted-tree.qza')
    table = q2.Artifact.load('./docs/moving-pictures/table.qza')
    metadata = q2.Metadata.load('./docs/moving-pictures/sample_metadata.tsv')
    pcoa = q2.Artifact.load('./docs/moving-pictures/unweighted-unifrac.pcoa.qza').view(OrdinationResults)

    output_dir = './dev-tree/'
    os.makedirs(output_dir, exist_ok=True)

    viz = Emperor(pcoa, metadata.to_dataframe(), remote='./emperor-resources/')
    viz.width = '48vw'
    viz.height = '100vh; float: right'

    # returns the jupyter template, so split the contents as needed
    html = viz.make_emperor(standalone=False)
    html = html.replace(' null, ec;', ' null;')
    html = html.split('\n')

    # print(html)
    viz.copy_support_files(os.path.join(output_dir, 'emperor-resources'))

    emperor_base_url = viz.base_url
    emperor_div = '\n'.join(html[16:21])
    emperor_require_logic = '\n'.join(html[20:])

    emperor_data = {
        'emperor_base_url': emperor_base_url,
        'emperor_div': emperor_div,
        'emperor_require_logic': emperor_require_logic
    }

    combined_plot(output_dir='./dev-tree/', tree=tree.view(NewickFormat),
                  feature_table=table.view(pd.DataFrame),
                  sample_metadata=metadata, emperor_data=emperor_data)

    return


if __name__ == '__main__':
    main()
