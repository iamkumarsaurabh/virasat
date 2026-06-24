from flask import render_template
from . import pages

@pages.route('/about')
def about():
    return render_template('about.html')

@pages.route('/privacy')
def privacy():
    return render_template('privacy.html')

@pages.route('/terms')
def terms():
    return render_template('terms.html')
